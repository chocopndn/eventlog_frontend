export const createViews = async (db) => {
  try {
    await db.execAsync(`
        CREATE VIEW IF NOT EXISTS user_details AS
        SELECT
          users.id_number,
          users.first_name,
          users.middle_name,
          users.last_name,
          users.suffix,
          users.email,
          roles.name AS role,
          blocks.name AS block,
          courses.name AS course,
          year_levels.name AS year_level,
          departments.name AS department,
          departments.code AS department_code,
          CASE
            WHEN users.middle_name IS NOT NULL THEN 
              users.first_name || ' ' || users.middle_name || ' ' || users.last_name
            ELSE 
              users.first_name || ' ' || users.last_name
          END AS full_name,
          CASE
            WHEN users.suffix IS NOT NULL THEN
              users.last_name || ', ' || users.suffix
            ELSE
              users.last_name
          END AS formatted_last_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        LEFT JOIN blocks ON users.block_id = blocks.id
        LEFT JOIN courses ON blocks.course_id = courses.id
        LEFT JOIN year_levels ON blocks.year_level_id = year_levels.id
        LEFT JOIN departments ON users.department_id = departments.id;
  
        CREATE VIEW IF NOT EXISTS event_details AS
        SELECT
          events.id,
          event_names.name AS event_name,
          events.venue,
          events.description,
          events.status,
          events.scan_personnel,
          event_dates.event_date,
          event_dates.am_in,
          event_dates.am_out,
          event_dates.pm_in,
          event_dates.pm_out,
          event_dates.duration,
          creator.full_name AS created_by,
          approver.full_name AS approved_by,
          event_blocks.block_id,
          blocks.name AS block_name
        FROM events
        JOIN event_names ON events.event_name_id = event_names.id
        JOIN event_dates ON events.id = event_dates.event_id
        LEFT JOIN user_details creator ON events.created_by = creator.id_number
        LEFT JOIN user_details approver ON events.approved_by = approver.id_number
        LEFT JOIN event_blocks ON events.id = event_blocks.event_id
        LEFT JOIN blocks ON event_blocks.block_id = blocks.id;
  
        CREATE VIEW IF NOT EXISTS attendance_summary AS
        SELECT
          attendance.id,
          attendance.student_id_number,
          students.full_name AS student_name,
          students.block AS student_block,
          event_details.event_name,
          event_details.event_date,
          attendance.am_in,
          attendance.am_out,
          attendance.pm_in,
          attendance.pm_out,
          CASE
            WHEN attendance.am_in IS NOT NULL AND attendance.am_out IS NOT NULL AND
                 attendance.pm_in IS NOT NULL AND attendance.pm_out IS NOT NULL THEN 'Present'
            WHEN attendance.am_in IS NULL AND attendance.am_out IS NULL AND
                 attendance.pm_in IS NULL AND attendance.pm_out IS NULL THEN 'Absent'
            ELSE 'Partial'
          END AS attendance_status
        FROM attendance
        JOIN user_details students ON attendance.student_id_number = students.id_number
        JOIN event_dates ON attendance.event_date_id = event_dates.id
        JOIN event_details ON event_dates.event_id = event_details.id;
      `);
  } catch (error) {
    console.error("Error creating database views:", error);
    throw error;
  }
};
