import { StyleSheet, Text, View, ScrollView, Platform } from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { useFonts } from "expo-font";
import WebHeader from "../../components/WebHeader";
import globalStyles from "../../constants/globalStyles";
import CustomSearch from "../../components/CustomSearch";
import CustomDropdown from "../../components/CustomDropdown";
import CustomButton from "../../components/CustomButton";
import PrintFilterModal from "../../components/PrintFilterModal";
import CustomModal from "../../components/CustomModal";
import theme from "../../constants/theme";
import ArialFont from "../../assets/fonts/Arial.ttf";
import ArialBoldFont from "../../assets/fonts/ArialBold.ttf";
import ArialItalicFont from "../../assets/fonts/ArialItalic.ttf";
import SquadaOneFont from "../../assets/fonts/SquadaOne.ttf";
import { fetchAttendanceSummaryOfEvent } from "../../services/api/records";
import { fetchBlocks, fetchDepartments } from "../../services/api";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const Records = () => {
  const { eventId } = useLocalSearchParams();
  const [fontsLoaded, fontError] = useFonts({
    Arial: require("../../assets/fonts/Arial.ttf"),
    ArialBold: require("../../assets/fonts/ArialBold.ttf"),
    ArialItalic: require("../../assets/fonts/ArialItalic.ttf"),
    SquadaOne: require("../../assets/fonts/SquadaOne.ttf"),
  });
  const [fontsReady, setFontsReady] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYearLevel, setSelectedYearLevel] = useState("");
  const [departments, setDepartments] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [currentAction, setCurrentAction] = useState("download");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "success",
    cancelTitle: "OK",
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.textContent = `
        @font-face {
          font-family: 'Arial';
          src: url('${ArialFont}') format('truetype');
          font-display: swap;
        }
        @font-face {
          font-family: 'ArialBold';
          src: url('${ArialBoldFont}') format('truetype');
          font-display: swap;
          font-weight: bold;
        }
        @font-face {
          font-family: 'ArialItalic';
          src: url('${ArialItalicFont}') format('truetype');
          font-display: swap;
          font-style: italic;
        }
        @font-face {
          font-family: 'SquadaOne';
          src: url('${SquadaOneFont}') format('truetype');
          font-display: swap;
        }
      `;
      const existingStyle = document.getElementById("records-custom-fonts");
      if (!existingStyle) {
        style.id = "records-custom-fonts";
        document.head.appendChild(style);
      }
      if (document.fonts) {
        Promise.all([
          document.fonts.load("16px Arial"),
          document.fonts.load("16px ArialBold"),
          document.fonts.load("16px ArialItalic"),
          document.fonts.load("16px SquadaOne"),
        ])
          .then(() => {
            setFontsReady(true);
          })
          .catch(() => {
            setFontsReady(true);
          });
      } else {
        setTimeout(() => {
          setFontsReady(true);
        }, 500);
      }
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" && fontsLoaded && !fontError) {
      setFontsReady(true);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      try {
        const [attendanceResponse, departmentsResponse, blocksResponse] =
          await Promise.all([
            fetchAttendanceSummaryOfEvent(eventId),
            fetchDepartments(),
            fetchBlocks().catch(() => null),
          ]);
        const students = attendanceResponse?.data?.students || [];
        const eventDetails = {
          id: attendanceResponse?.data?.event_id,
          name:
            attendanceResponse?.data?.event_name ||
            attendanceResponse?.data?.event?.name ||
            attendanceResponse?.data?.event?.event_name ||
            "Event Attendance Report",
          status:
            attendanceResponse?.data?.event_status ||
            attendanceResponse?.data?.event?.status,
        };
        setAttendanceData(students);
        setEventInfo(eventDetails);
        const eventBlockIds = attendanceResponse?.data?.block_ids || [];
        const studentDepartments = [
          ...new Set(
            students.map((student) => student.department_code).filter(Boolean)
          ),
        ];
        const apiDepartments = departmentsResponse?.data || [];
        const departmentOptions = [
          { label: "All Departments", value: "" },
          ...studentDepartments.map((deptCode) => {
            const apiDept = apiDepartments.find(
              (dept) => dept.code === deptCode
            );
            return {
              label: apiDept ? `${apiDept.code} - ${apiDept.name}` : deptCode,
              value: deptCode,
            };
          }),
          ...apiDepartments
            .filter((dept) => !studentDepartments.includes(dept.code))
            .map((dept) => ({
              label: `${dept.code} - ${dept.name}`,
              value: dept.code,
            })),
        ].sort((a, b) => a.label.localeCompare(b.label));
        const uniqueDepartmentOptions = departmentOptions.filter(
          (dept, index, self) =>
            index === self.findIndex((d) => d.value === dept.value)
        );
        const yearLevelOptions = [
          { label: "All Year Levels", value: "" },
          ...(attendanceResponse?.data?.year_levels || [])
            .map((yearLevel) => ({
              label: yearLevel.name,
              value: String(yearLevel.id),
            }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        ];
        let blockOptions = [];
        if (blocksResponse?.data && Array.isArray(blocksResponse.data)) {
          blockOptions = blocksResponse.data
            .filter(
              (block) =>
                eventBlockIds.includes(block.id) &&
                block.name &&
                block.name.trim() !== ""
            )
            .map((block) => {
              const uniqueBlockKey = block.course_code
                ? `${block.course_code}_${block.name}`
                : block.name;
              const displayLabel = block.course_code
                ? `${block.course_code} ${block.name}`
                : block.name;
              return {
                key: `block-${block.id}`,
                label: displayLabel,
                value: uniqueBlockKey,
                id: String(block.id),
                block_id: String(block.id),
                block_name: block.name,
                course_code: block.course_code,
                course_name: block.course_name,
                department_id: block.department_id,
                department_code: block.department_code,
                year_level_id: block.year_level_id,
                display_name: displayLabel,
                name: displayLabel,
              };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
        } else {
          blockOptions = (attendanceResponse?.data?.blocks || [])
            .filter((block) => block.name && block.name.trim() !== "")
            .map((block) => {
              const uniqueBlockKey = block.course_code
                ? `${block.course_code}_${block.name}`
                : block.name;
              const displayLabel = block.course_code
                ? `${block.course_code} ${block.name}`
                : block.name;
              return {
                key: `block-${block.id}`,
                label: displayLabel,
                value: uniqueBlockKey,
                id: String(block.id),
                block_id: String(block.id),
                block_name: block.name,
                course_code: block.course_code,
                course_name: block.course_name,
                department_id: block.department_id,
                department_code: block.department_code,
                year_level_id: block.year_level_id,
                display_name: displayLabel,
                name: displayLabel,
              };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
        }
        setDepartments(uniqueDepartmentOptions);
        setYearLevels(yearLevelOptions);
        setBlocks(blockOptions);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    if (fontsReady) {
      fetchData();
    }
  }, [eventId, fontsReady]);

  const filteredData = useMemo(() => {
    return attendanceData.filter((student) => {
      const matchesSearch =
        !searchQuery ||
        (student.full_name &&
          student.full_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (student.id_number &&
          student.id_number
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (student.block_name &&
          student.block_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDepartment =
        !selectedDepartment ||
        selectedDepartment === "" ||
        selectedDepartment === "error" ||
        (student.department_code &&
          String(student.department_code) === String(selectedDepartment));
      const matchesYearLevel =
        !selectedYearLevel ||
        selectedYearLevel === "" ||
        selectedYearLevel === "error" ||
        (student.year_level_id &&
          String(student.year_level_id) === String(selectedYearLevel));
      return matchesSearch && matchesDepartment && matchesYearLevel;
    });
  }, [attendanceData, searchQuery, selectedDepartment, selectedYearLevel]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleDepartmentChange = (item) => {
    setSelectedDepartment(item.value);
  };

  const handleYearLevelChange = (item) => {
    setSelectedYearLevel(item.value);
  };

  const generatePrintDocument = async (students, filters, action) => {
    const { attendanceFilter = "all" } = filters;
    const studentsByBlock = {};
    students.forEach((student) => {
      let blockDisplay = "Unknown Block";
      if (student.block_display) {
        blockDisplay = student.block_display;
      } else if (student.course_code && student.block_name) {
        blockDisplay = `${student.course_code} ${student.block_name}`;
      } else if (student.block_name) {
        blockDisplay = student.block_name;
      } else if (student.block_id) {
        const studentBlock = blocks.find(
          (block) =>
            block.block_id === String(student.block_id) ||
            block.id === String(student.block_id)
        );
        if (studentBlock) {
          blockDisplay =
            studentBlock.course_code && studentBlock.block_name
              ? `${studentBlock.course_code} ${studentBlock.block_name}`
              : studentBlock.block_name ||
                studentBlock.label ||
                "Unknown Block";
        }
      }
      if (!studentsByBlock[blockDisplay]) {
        studentsByBlock[blockDisplay] = {
          students: [],
          availableTimePeriods: {
            hasAmIn: true,
            hasAmOut: true,
            hasPmIn: true,
            hasPmOut: true,
          },
        };
      }
      studentsByBlock[blockDisplay].students.push({
        id: student.id_number || "N/A",
        name: student.full_name || "N/A",
        present: student.present_count || 0,
        absent: student.absent_count || 0,
        am_in: student.am_in_attended || 0,
        am_out: student.am_out_attended || 0,
        pm_in: student.pm_in_attended || 0,
        pm_out: student.pm_out_attended || 0,
      });
    });

    Object.keys(studentsByBlock).forEach((blockKey) => {
      studentsByBlock[blockKey].students.sort((a, b) => {
        const nameA = a.name ? a.name.toLowerCase() : "";
        const nameB = b.name ? b.name.toLowerCase() : "";
        return nameA.localeCompare(nameB);
      });
    });

    const generateBlockPage = (blockName, blockData, isFirst = false) => {
      const { students, availableTimePeriods } = blockData;
      let headerColumns = `
      <span class="col-id">ID Number</span>
      <span class="col-name">Name</span>
    `;
      if (availableTimePeriods.hasAmIn) {
        headerColumns += '<span class="col-time">AM In</span>';
      }
      if (availableTimePeriods.hasAmOut) {
        headerColumns += '<span class="col-time">AM Out</span>';
      }
      if (availableTimePeriods.hasPmIn) {
        headerColumns += '<span class="col-time">PM In</span>';
      }
      if (availableTimePeriods.hasPmOut) {
        headerColumns += '<span class="col-time">PM Out</span>';
      }
      headerColumns += `
      <span class="col-count">Present</span>
      <span class="col-count">Absent</span>
    `;
      const studentRows =
        students.length === 0
          ? `<div style="text-align: center; margin-top: 20px; font-style: italic; color: #666;">
           No records
         </div>`
          : students
              .map((record) => {
                let rowColumns = `
            <span class="col-id">${record.id}</span>
            <span class="col-name">${record.name}</span>
          `;
                if (availableTimePeriods.hasAmIn) {
                  rowColumns += `<span class="col-time">${record.am_in}</span>`;
                }
                if (availableTimePeriods.hasAmOut) {
                  rowColumns += `<span class="col-time">${record.am_out}</span>`;
                }
                if (availableTimePeriods.hasPmIn) {
                  rowColumns += `<span class="col-time">${record.pm_in}</span>`;
                }
                if (availableTimePeriods.hasPmOut) {
                  rowColumns += `<span class="col-time">${record.pm_out}</span>`;
                }
                rowColumns += `
            <span class="col-count">${record.present}</span>
            <span class="col-count">${record.absent}</span>
          `;
                return `<div class="record-line">${rowColumns}</div>`;
              })
              .join("");

      return `
      <div style="${
        isFirst
          ? "padding-top: 10px;"
          : "page-break-before: always; padding-top: 10px;"
      }">
        <h2 style="color: black; text-align: left; margin-bottom: 3px;">${
          eventInfo?.name && eventInfo.name !== "eventloging"
            ? eventInfo.name
            : "Event Attendance Report"
        }</h2>
        <h3 style="color: black; text-align: left; margin-bottom: 3px;">${
          attendanceFilter === "all"
            ? "General List"
            : attendanceFilter === "present"
            ? "Present List"
            : "Absent List"
        }</h3>
        <h4 style="color: black; text-align: left; margin-bottom: 3px;">Date: ${new Date().toLocaleDateString()}</h4>
        <h3 style="color: black; text-align: left; margin-bottom: 10px;">${blockName}</h3>
        <div class="header-line">
          ${headerColumns}
        </div>
        ${studentRows}
      </div>
    `;
    };

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Attendance Report - ${eventInfo?.name || "Event"}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 0px 20px 20px 20px; 
            color: black;
            font-size: 11px;
            background: white;
          }
          h1, h2, h3, h4 { 
            color: black; 
            text-align: left;
            margin-bottom: 3px;
          }
          .header-line {
            color: black;
            font-weight: bold;
            margin-bottom: 10px;
            display: flex;
          }
          .record-line {
            color: black;
            margin-bottom: 2px;
            display: flex;
          }
          .col-id { 
            width: 90px; 
            padding: 4px;
            text-align: left;
          }
          .col-name { 
            width: 200px; 
            padding: 4px;
            text-align: left;
          }
          .col-time { 
            width: 55px; 
            text-align: left; 
            font-size: 11px;
            padding: 4px;
          }
          .col-count { 
            width: 55px; 
            text-align: left;
            padding: 4px;
          }
          @media print {
            body { 
              margin: 0; 
              padding: 10px;
              -webkit-print-color-adjust: exact;
            }
            h1, h2, h3, h4 { 
              margin-bottom: 10px; 
            }
            .header-line, .record-line { 
              page-break-inside: avoid; 
            }
            div[style*="page-break-before"] { 
              page-break-before: always; 
            }
          }
          .react-native-screen,
          .expo-web-container,
          body > div:not(.page-content) {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div class="page-content">
          ${Object.entries(studentsByBlock)
            .map(([blockName, blockData], index) =>
              generateBlockPage(blockName, blockData, index === 0)
            )
            .join("")}
        </div>
      </body>
    </html>
  `;

    if (action === "print") {
      if (Platform.OS === "web") {
        const printWindow = window.open(
          "",
          "_blank",
          "width=900,height=700,scrollbars=yes"
        );
        if (!printWindow) {
          setModalConfig({
            title: "Print Blocked",
            message: "Please allow popups for this site to enable printing.",
            type: "warning",
            cancelTitle: "OK",
          });
          setModalVisible(true);
          return;
        }
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        const triggerPrint = () => {
          try {
            printWindow.focus();
            if (printWindow.print) {
              printWindow.print();
            } else {
              printWindow.document.execCommand("print", false, null);
            }
            setTimeout(() => {
              if (!printWindow.closed) {
                printWindow.close();
              }
            }, 2000);
          } catch (printError) {
            setModalConfig({
              title: "Print Error",
              message:
                "Could not open print dialog. Please try manually printing from the new window.",
              type: "warning",
              cancelTitle: "OK",
            });
            setModalVisible(true);
          }
        };

        if (printWindow.document.readyState === "complete") {
          setTimeout(triggerPrint, 500);
        } else {
          printWindow.onload = () => {
            setTimeout(triggerPrint, 500);
          };
          setTimeout(() => {
            if (printWindow.document.readyState === "complete") {
              triggerPrint();
            }
          }, 1000);
        }

        return;
      } else {
        try {
          await Print.printAsync({
            html,
            orientation: Print.Orientation.portrait,
            margins: {
              left: 20,
              top: 20,
              right: 20,
              bottom: 20,
            },
          });
          setModalConfig({
            title: "Print Successful",
            message: "Custom report sent to printer successfully.",
            type: "success",
            cancelTitle: "OK",
          });
        } catch (printError) {
          console.error("Print error:", printError);
          setModalConfig({
            title: "Print Failed",
            message: "Failed to print the custom report. Please try again.",
            type: "error",
            cancelTitle: "OK",
          });
        }
      }
    } else {
      try {
        if (Platform.OS === "web") {
          const printWindow = window.open("", "_blank", "width=900,height=700");
          printWindow.document.open();
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.focus();
              printWindow.print();
              setTimeout(() => {
                printWindow.close();
              }, 1000);
            }, 500);
          };
          setModalConfig({
            title: "PDF Preview Opened",
            message: "Use your browser's print dialog to save as PDF.",
            type: "success",
            cancelTitle: "OK",
          });
        } else {
          const { uri } = await Print.printToFileAsync({
            html: html,
            width: 612,
            height: 792,
            margins: {
              left: 20,
              top: 20,
              right: 20,
              bottom: 20,
            },
          });
          const filterName =
            attendanceFilter === "all"
              ? "General_List"
              : attendanceFilter === "present"
              ? "Present_List"
              : "Absent_List";
          const pdfName = `${
            eventInfo?.name && eventInfo.name !== "eventloging"
              ? eventInfo.name
                  .replace(/[^a-zA-Z0-9\s]/g, "")
                  .replace(/\s+/g, "_")
              : "Attendance_Report"
          }_${filterName}_${new Date().toISOString().split("T")[0]}.pdf`;
          const pdfPath = `${FileSystem.documentDirectory}${pdfName}`;
          await FileSystem.moveAsync({ from: uri, to: pdfPath });
          await Sharing.shareAsync(pdfPath, {
            UTI: ".pdf",
            mimeType: "application/pdf",
          });
          setModalConfig({
            title: "Download Successful",
            message: `Custom ${filterName.replace(
              "_",
              " "
            )} report downloaded successfully.`,
            type: "success",
            cancelTitle: "OK",
          });
        }
      } catch (downloadError) {
        console.error("Download error:", downloadError);
        setModalConfig({
          title: "Download Failed",
          message: "Failed to download the custom report. Please try again.",
          type: "error",
          cancelTitle: "OK",
        });
      }
    }
    setModalVisible(true);
  };

  const handlePrintDownload = async (filters, action = "download") => {
    try {
      const {
        departmentIds,
        yearLevelIds,
        blockIds,
        attendanceFilter = "all",
      } = filters;
      setLoading(true);
      let filteredStudents = [...attendanceData];
      if (attendanceFilter === "present") {
        filteredStudents = filteredStudents.filter(
          (student) => (student.present_count || 0) > 0
        );
      } else if (attendanceFilter === "absent") {
        filteredStudents = filteredStudents.filter(
          (student) =>
            (student.absent_count || 0) > 0 ||
            (student.present_count || 0) === 0
        );
      }
      if (departmentIds && departmentIds.length > 0) {
        filteredStudents = filteredStudents.filter((student) => {
          return departmentIds.some(
            (deptId) =>
              String(student.department_code) === String(deptId) ||
              String(student.department_id) === String(deptId)
          );
        });
      }
      if (yearLevelIds && yearLevelIds.length > 0) {
        filteredStudents = filteredStudents.filter((student) => {
          return yearLevelIds.some(
            (yearId) => String(student.year_level_id) === String(yearId)
          );
        });
      }
      if (blockIds && blockIds.length > 0) {
        filteredStudents = filteredStudents.filter((student) => {
          return blockIds.some((blockValue) => {
            const selectedBlock = blocks.find(
              (block) =>
                block.value === blockValue ||
                block.block_id === blockValue ||
                block.id === blockValue
            );
            if (!selectedBlock) return false;
            const matches =
              String(student.block_id) === String(selectedBlock.block_id) ||
              String(student.block_id) === String(selectedBlock.id) ||
              (student.block_name === selectedBlock.block_name &&
                student.course_code === selectedBlock.course_code) ||
              (student.course_code &&
                student.block_name &&
                `${student.course_code}_${student.block_name}` ===
                  selectedBlock.value) ||
              student.block_name === selectedBlock.block_name;
            return matches;
          });
        });
      }
      if (filteredStudents.length === 0) {
        setModalConfig({
          title: "No Students Found",
          message:
            departmentIds?.length > 0 ||
            yearLevelIds?.length > 0 ||
            blockIds?.length > 0 ||
            attendanceFilter !== "all"
              ? "No students match the selected filter criteria."
              : "No students available for this event.",
          type: "warning",
          cancelTitle: "OK",
        });
        setModalVisible(true);
        setLoading(false);
        return;
      }
      filteredStudents = filteredStudents.map((student) => {
        const studentBlock = blocks.find(
          (block) =>
            block.block_id === String(student.block_id) ||
            block.id === String(student.block_id)
        );
        return {
          ...student,
          course_code: student.course_code || studentBlock?.course_code || "",
          block_name: student.block_name || studentBlock?.block_name || "",
          block_display:
            (student.course_code || studentBlock?.course_code) &&
            (student.block_name || studentBlock?.block_name)
              ? `${student.course_code || studentBlock?.course_code} ${
                  student.block_name || studentBlock?.block_name
                }`
              : student.block_name || studentBlock?.block_name || "N/A",
        };
      });
      await generatePrintDocument(filteredStudents, filters, action);
    } catch (error) {
      console.error("Print/Download error:", error);
      setModalConfig({
        title: action === "print" ? "Print Failed" : "Download Failed",
        message: `An error occurred while ${
          action === "print" ? "printing" : "generating"
        } the report: ${error.message}`,
        type: "error",
        cancelTitle: "OK",
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPress = () => {
    if (attendanceData.length === 0) {
      setModalConfig({
        title: "No Data Available",
        message: "No attendance data available to download.",
        type: "warning",
        cancelTitle: "OK",
      });
      setModalVisible(true);
      return;
    }
    setCurrentAction("download");
    setShowPrintModal(true);
  };

  const handlePrintPress = () => {
    if (attendanceData.length === 0) {
      setModalConfig({
        title: "No Data Available",
        message: "No attendance data available to print.",
        type: "warning",
        cancelTitle: "OK",
      });
      setModalVisible(true);
      return;
    }
    setCurrentAction("print");
    setShowPrintModal(true);
  };

  if (!fontsReady) {
    return (
      <View
        style={[
          globalStyles.secondaryContainer,
          { padding: 0, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text
          style={{
            fontFamily:
              Platform.OS === "web" ? "system-ui, sans-serif" : "system",
            fontSize: 18,
            color: theme.colors.primary,
            marginBottom: 10,
          }}
        >
          Loading...
        </Text>
        {Platform.OS === "web" && (
          <Text
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              color: "#666",
              textAlign: "center",
            }}
          >
            Preparing records interface
          </Text>
        )}
      </View>
    );
  }

  const renderAttendanceRow = (item, index) => {
    const uniqueKey = item.id_number
      ? `student-${item.id_number}`
      : `student-${index}`;
    const blockDisplay =
      item.course_code && item.block_name
        ? `${item.course_code} ${item.block_name}`
        : item.block_name || "N/A";
    return (
      <View key={uniqueKey} style={styles.listRow}>
        <View style={[styles.id, styles.dataCell]}>
          <Text style={styles.dataTextStyle}>{item.id_number || "N/A"}</Text>
        </View>
        <View style={[styles.name, styles.dataCell]}>
          <Text style={styles.dataTextStyle}>{item.full_name || "N/A"}</Text>
        </View>
        <View style={[styles.block, styles.dataCell]}>
          <Text style={styles.dataTextStyle}>{blockDisplay}</Text>
        </View>
        <View style={[styles.department, styles.dataCell]}>
          <Text style={styles.dataTextStyle}>
            {item.department_code || "N/A"}
          </Text>
        </View>
        <View style={[styles.present, styles.dataCell]}>
          <Text style={styles.dataTextStyle}>{item.present_count || 0}</Text>
        </View>
        <View style={[styles.absent, styles.dataCell]}>
          <Text style={styles.dataTextStyle}>{item.absent_count || 0}</Text>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        globalStyles.secondaryContainer,
        { padding: 0, justifyContent: "flex-start" },
      ]}
    >
      <WebHeader />
      {eventInfo && (
        <View style={styles.eventInfoContainer}>
          <Text style={styles.eventTitle}>{eventInfo.name}</Text>
        </View>
      )}
      <View style={styles.searchContainer}>
        <CustomSearch
          onSearch={handleSearch}
          value={searchQuery}
          placeholder="Search by name"
        />
      </View>
      <View style={styles.dropdownWrapper}>
        <View style={[styles.dropdownContainer, { zIndex: 1002 }]}>
          <CustomDropdown
            display="sharp"
            placeholder="Department"
            data={departments}
            labelField="label"
            valueField="value"
            value={selectedDepartment}
            onSelect={handleDepartmentChange}
            containerStyle={{ zIndex: 1002 }}
            dropdownStyle={{ zIndex: 1002 }}
          />
        </View>
        <View
          style={[
            styles.dropdownContainer,
            { marginLeft: theme.spacing.medium, zIndex: 1001 },
          ]}
        >
          <CustomDropdown
            display="sharp"
            placeholder="Year Level"
            data={yearLevels}
            labelField="label"
            valueField="value"
            value={selectedYearLevel}
            onSelect={handleYearLevelChange}
            containerStyle={{ zIndex: 1001 }}
            dropdownStyle={{ zIndex: 1001 }}
          />
        </View>
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.listHeader}>
          <View style={[styles.id, styles.headerText]}>
            <Text style={styles.headerTextStyle}>ID Number</Text>
          </View>
          <View style={[styles.name, styles.headerText]}>
            <Text style={styles.headerTextStyle}>Name</Text>
          </View>
          <View style={[styles.block, styles.headerText]}>
            <Text style={styles.headerTextStyle}>Block</Text>
          </View>
          <View style={[styles.department, styles.headerText]}>
            <Text style={styles.headerTextStyle}>Department</Text>
          </View>
          <View style={[styles.present, styles.headerText]}>
            <Text style={styles.headerTextStyle}>Present</Text>
          </View>
          <View style={[styles.absent, styles.headerText]}>
            <Text style={styles.headerTextStyle}>Absent</Text>
          </View>
        </View>
        <ScrollView
          style={styles.scrollViewContent}
          contentContainerStyle={styles.scrollView}
        >
          {loading && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Loading attendance data...</Text>
            </View>
          )}
          {error && (
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: theme.colors.error }]}>
                Error: {error}
              </Text>
            </View>
          )}
          {!loading && !error && attendanceData.length === 0 && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                {eventId
                  ? "No attendance data found for this event"
                  : "No event selected"}
              </Text>
            </View>
          )}
          {!loading &&
            !error &&
            attendanceData.length > 0 &&
            filteredData.length === 0 && (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                  No students match your search criteria
                </Text>
              </View>
            )}
          {!loading && !error && filteredData.length > 0 && (
            <View style={styles.dataContainer}>
              {filteredData.map((item, index) =>
                renderAttendanceRow(item, index)
              )}
            </View>
          )}
        </ScrollView>
      </View>
      <View style={styles.printDlButton}>
        <View style={styles.buttonWrapper}>
          <View style={styles.buttonContainer}>
            <CustomButton
              title="DOWNLOAD"
              onPress={handleDownloadPress}
              disabled={loading || attendanceData.length === 0}
            />
          </View>
          <View style={styles.buttonContainer}>
            <CustomButton
              title="PRINT"
              onPress={handlePrintPress}
              disabled={loading || attendanceData.length === 0}
            />
          </View>
        </View>
      </View>
      <PrintFilterModal
        visible={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onPrint={(filters) => {
          handlePrintDownload(filters, currentAction);
        }}
        showDepartment={true}
        showYearLevel={true}
        showBlock={true}
        showAttendance={true}
        departments={departments.filter((dept) => dept.value !== "")}
        yearLevels={yearLevels.filter((year) => year.value !== "")}
        blocks={blocks}
        students={attendanceData}
        title={currentAction === "print" ? "Print Options" : "Download Options"}
        buttonTitle={currentAction === "print" ? "Print" : "Download"}
        currentAction={currentAction}
      />
      <CustomModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        cancelTitle={modalConfig.cancelTitle}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
};

export default Records;

const styles = StyleSheet.create({
  searchContainer: {
    width: "90%",
    paddingTop: 20,
  },
  eventInfoContainer: {
    width: "90%",
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  eventTitle: {
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: 50,
    color: theme.colors.primary,
    textAlign: "center",
  },
  eventStatus: {
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.success || "#4CAF50",
    textAlign: "center",
  },
  eventId: {
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.small,
    color: theme.colors.text || "#666",
    textAlign: "center",
  },
  dropdownWrapper: {
    flexDirection: "row",
    marginTop: theme.spacing.large,
    width: "90%",
    justifyContent: "center",
    zIndex: 1000,
  },
  dropdownContainer: {
    width: "49%",
    zIndex: 1000,
    elevation: Platform.OS === "android" ? 1000 : undefined,
  },
  buttonContainer: {
    width: "30%",
    padding: theme.spacing.medium,
  },
  buttonWrapper: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  printDlButton: {
    width: "100%",
  },
  scrollView: {
    justifyContent: "center",
    alignItems: "center",
  },
  tableContainer: {
    width: "90%",
    flex: 1,
  },
  scrollViewContent: {
    width: "100%",
    flex: 1,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  headerText: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.primary,
    padding: theme.spacing.small,
  },
  headerTextStyle: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.large,
    textAlign: "center",
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  dataCell: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: theme.spacing.small,
    backgroundColor: theme.colors.secondary,
  },
  dataTextStyle: {
    fontFamily: theme.fontFamily.Arial,
    color: theme.colors.text || "#333",
    fontSize: theme.fontSizes.medium,
    textAlign: "center",
  },
  dataContainer: {
    width: "100%",
  },
  statusContainer: {
    padding: theme.spacing.large,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text || "#666",
    textAlign: "center",
  },
  id: {
    flex: 1,
  },
  name: {
    flex: 2,
  },
  block: {
    flex: 1,
  },
  department: {
    flex: 1,
  },
  present: {
    flex: 1,
  },
  absent: {
    flex: 1,
  },
});
