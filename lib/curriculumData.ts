export type CurriculumSubject = {
  level: number;
  semester: number;
  code: string;
  name: string;
  credits: number;
};

export const curriculumData: CurriculumSubject[] = [
  // ==========================================
  // COMPUTING & INFORMATION SYSTEMS (CMIS)
  // ==========================================
  { level: 1, semester: 1, code: 'CMIS 1113', name: 'Introduction to Computers and Operating Systems', credits: 3 },
  { level: 1, semester: 1, code: 'CMIS 1123', name: 'Computer Programming I', credits: 3 },
  { level: 1, semester: 1, code: 'CMIS 1131', name: 'Practical Computing I', credits: 1 },
  
  { level: 1, semester: 2, code: 'CMIS 1212', name: 'Computer Programming II', credits: 2 },
  { level: 1, semester: 2, code: 'CMIS 1221', name: 'Practical Computing II', credits: 1 },

  { level: 2, semester: 1, code: 'CMIS 2113', name: 'Object-oriented Programming', credits: 3 },
  { level: 2, semester: 1, code: 'CMIS 2123', name: 'Database Management Systems', credits: 3 },

  { level: 2, semester: 2, code: 'CMIS 2214', name: 'Data Structures & Analysis of Algorithms', credits: 4 },

  { level: 3, semester: 1, code: 'CMIS 3114', name: 'Data Communication & Comp. Networks', credits: 4 },
  { level: 3, semester: 1, code: 'CMIS 3124', name: 'Web Designing and e-commerce', credits: 4 },
  { level: 3, semester: 1, code: 'CMIS 3134', name: 'Computer Architecture & Compiler Design', credits: 4 },
  { level: 3, semester: 1, code: 'CMIS 3142', name: 'Computational Methods', credits: 2 },
  { level: 3, semester: 1, code: 'CMIS 3153', name: 'Advanced Database Systems', credits: 3 },

  { level: 3, semester: 2, code: 'CMIS 3214', name: 'Software Engineering', credits: 4 },
  { level: 3, semester: 2, code: 'CMIS 3222', name: 'Rapid Application Development', credits: 2 },
  { level: 3, semester: 2, code: 'CMIS 3234', name: 'Computer Graphics and Visualization', credits: 4 },
  { level: 3, semester: 2, code: 'CMIS 3242', name: 'Mobile and Ubiquitous Computing', credits: 2 },
  { level: 3, semester: 2, code: 'CMIS 3253', name: 'Data Mining', credits: 3 },

  { level: 4, semester: 1, code: 'CMIS 4114', name: 'Artificial Intelligence', credits: 4 },
  { level: 4, semester: 1, code: 'CMIS 4123', name: 'Advanced Operating Systems', credits: 3 },
  { level: 4, semester: 1, code: 'CMIS 4134', name: 'Distributed and Cloud Computing', credits: 4 },
  { level: 4, semester: 1, code: 'CMIS 4142', name: 'Image Processing', credits: 2 },
  { level: 4, semester: 1, code: 'CMIS 4153', name: 'Parallel Computing', credits: 3 },
  { level: 4, semester: 1, code: 'CMIS 418', name: 'Research Project', credits: 8 },
  { level: 4, semester: 1, code: 'CMIS 426', name: 'Research Project', credits: 6 },

  { level: 4, semester: 2, code: 'CMIS 4216', name: 'Industrial Training (INDT 4216 / CMIS 4216)', credits: 6 },

  // ==========================================
  // ELECTRONICS (ELTN)
  // ==========================================
  { level: 1, semester: 1, code: 'ELTN 1112', name: 'Fundamentals of Electricity and Magnetism', credits: 2 },
  { level: 1, semester: 1, code: 'ELTN 1122', name: 'Introduction to Semiconductors', credits: 2 },
  { level: 1, semester: 1, code: 'ELTN 1132', name: 'Basic Digital Electronics', credits: 2 },

  { level: 1, semester: 2, code: 'ELTN 1212', name: 'Basic Electronics - Lab', credits: 2 },
  { level: 1, semester: 2, code: 'ELTN 1222', name: 'General Physics', credits: 2 },

  { level: 2, semester: 1, code: 'ELTN 2112', name: 'Electricity and Magnetism', credits: 2 },
  { level: 2, semester: 1, code: 'ELTN 2121', name: 'Electricity and Magnetism - Lab', credits: 1 },

  { level: 2, semester: 2, code: 'ELTN 2213', name: 'Semiconductor Devices', credits: 3 },
  { level: 2, semester: 2, code: 'ELTN 2221', name: 'Semiconductor Devices - Lab', credits: 1 },
  { level: 2, semester: 2, code: 'ELTN 2232', name: 'Analogue Electronics', credits: 2 },
  { level: 2, semester: 2, code: 'ELTN 2241', name: 'Analogue Electronics - Lab', credits: 1 },

  { level: 3, semester: 1, code: 'ELTN 3113', name: 'Digital Electronics', credits: 3 },
  { level: 3, semester: 1, code: 'ELTN 3121', name: 'Digital Electronics - Lab', credits: 1 },
  { level: 3, semester: 1, code: 'ELTN 3133', name: 'Data Acquisition and Signal Processing', credits: 3 },
  { level: 3, semester: 1, code: 'ELTN 3141', name: 'Data Acquisition and Signal Processing - Lab', credits: 1 },
  { level: 3, semester: 1, code: 'ELTN 353', name: 'Applied Electronics Laboratory I', credits: 3 },

  { level: 3, semester: 2, code: 'ELTN 3212', name: 'AC Theory', credits: 2 },
  { level: 3, semester: 2, code: 'ELTN 3222', name: 'Scientific Writing', credits: 2 },
  { level: 3, semester: 2, code: 'ELTN 3233', name: 'Microprocessor and Microcontroller Technology', credits: 3 },
  { level: 3, semester: 2, code: 'ELTN 3241', name: 'Microprocessor and Microcontroller Technology - Lab', credits: 1 },
  { level: 3, semester: 2, code: 'ELTN 3252', name: 'Electromagnetic Theory', credits: 2 },
  { level: 3, semester: 2, code: 'ELTN 3262', name: 'Power Electronics', credits: 2 },
  { level: 3, semester: 2, code: 'ELTN 3272', name: 'Optimization Techniques and Applications', credits: 2 },
  { level: 3, semester: 2, code: 'ELTN 3282', name: 'Mechatronics', credits: 2 },

  { level: 4, semester: 1, code: 'ELTN 4114', name: 'Communication Theory and Systems', credits: 4 },
  { level: 4, semester: 1, code: 'ELTN 4122', name: 'Optoelectronics Devices and Fiber Communication Systems', credits: 2 },
  { level: 4, semester: 1, code: 'ELTN 4131', name: 'Communication Technology - Lab', credits: 1 },
  { level: 4, semester: 1, code: 'ELTN 4143', name: 'Programmable Logic Devices', credits: 3 },
  { level: 4, semester: 1, code: 'ELTN 4151', name: 'Programmable Logic Devices - Lab', credits: 1 },
  { level: 4, semester: 1, code: 'ELTN 463', name: 'Applied Electronics Laboratory II', credits: 3 },
  { level: 4, semester: 1, code: 'ELTN 478', name: 'Research Project', credits: 8 },
  { level: 4, semester: 1, code: 'ELTN 486', name: 'Research Project', credits: 6 },
  { level: 4, semester: 1, code: 'ELTN 492', name: 'Seminar in Electronics', credits: 2 },

  { level: 4, semester: 2, code: 'ELTN 4213', name: 'Digital Signal Processing', credits: 3 },
  { level: 4, semester: 2, code: 'ELTN 4222', name: 'Nano-Technology Devices and Nano-Materials', credits: 2 },
  { level: 4, semester: 2, code: 'ELTN 4232', name: 'Data Communication Networks', credits: 2 },
  { level: 4, semester: 2, code: 'ELTN 4242', name: 'Solid State Theory', credits: 2 },
  { level: 4, semester: 2, code: 'ELTN 4252', name: 'Polymer Electronics', credits: 2 },
  { level: 4, semester: 2, code: 'ELTN 4272', name: 'Embedded Systems', credits: 2 },
  { level: 4, semester: 2, code: 'ELTN 4282', name: 'Antenna Design', credits: 2 },
  { level: 4, semester: 2, code: 'INDT 4216', name: 'Industrial Training', credits: 6 },

  // ==========================================
  // INDUSTRIAL MANAGEMENT (IMGT)
  // ==========================================
  { level: 1, semester: 1, code: 'IMGT 1112', name: 'Principles of Management', credits: 2 },
  { level: 1, semester: 1, code: 'IMGT 1122', name: 'Business Economics', credits: 2 },
  { level: 1, semester: 1, code: 'IMGT 1132', name: 'Entrepreneurial Dynamics', credits: 2 },

  { level: 1, semester: 2, code: 'IMGT 1212', name: 'Principles of Accounting', credits: 2 },
  { level: 1, semester: 2, code: 'IMGT 1222', name: 'Marketing Management', credits: 2 },

  { level: 2, semester: 1, code: 'IMGT 2112', name: 'Operations Management I', credits: 2 },
  { level: 2, semester: 1, code: 'IMGT 2122', name: 'Cost & Management Accounting', credits: 2 },
  { level: 2, semester: 1, code: 'IMGT 2132', name: 'Service Industry Concepts', credits: 2 },

  { level: 2, semester: 2, code: 'IMGT 2212', name: 'Human Resource Management', credits: 2 },
  { level: 2, semester: 2, code: 'IMGT 2222', name: 'Operations Research I', credits: 2 },

  { level: 3, semester: 1, code: 'IMGT 3112', name: 'Operations Management II', credits: 2 },
  { level: 3, semester: 1, code: 'IMGT 3122', name: 'Organization Development', credits: 2 },
  { level: 3, semester: 1, code: 'IMGT 334', name: 'Design & Development of Computer Based Project', credits: 4 },
  { level: 3, semester: 1, code: 'IMGT 3142', name: 'System Analysis & Design and MIS', credits: 2 },
  { level: 3, semester: 1, code: 'IMGT 3152', name: 'Productivity Techniques', credits: 2 },
  { level: 3, semester: 1, code: 'IMGT 3162', name: 'Business & Industrial Law', credits: 2 },
  { level: 3, semester: 1, code: 'IMGT 3172', name: 'Business Analytics', credits: 2 },

  { level: 3, semester: 2, code: 'IMGT 3212', name: 'Operations Research II', credits: 2 },
  { level: 3, semester: 2, code: 'IMGT 3222', name: 'Management of Technology', credits: 2 },
  { level: 3, semester: 2, code: 'IMGT 3232', name: 'International Business', credits: 2 },
  { level: 3, semester: 2, code: 'IMGT 3242', name: 'Project Management', credits: 2 },
  { level: 3, semester: 2, code: 'IMGT 3252', name: 'Industrial Technology', credits: 2 },
  { level: 3, semester: 2, code: 'IMGT 3262', name: 'Financial Management', credits: 2 },
  { level: 3, semester: 2, code: 'IMGT 3272', name: 'Research Methodology', credits: 2 },

  { level: 4, semester: 1, code: 'IMGT 416', name: 'Research Project', credits: 6 },
  { level: 4, semester: 1, code: 'IMGT 4123', name: 'Environmental Management', credits: 3 },
  { level: 4, semester: 1, code: 'IMGT 4133', name: 'Computer based Modelling & Simulation', credits: 3 },
  { level: 4, semester: 1, code: 'IMGT 4142', name: 'Supply Chain Management', credits: 2 },
  { level: 4, semester: 1, code: 'IMGT 4152', name: 'Strategic Management', credits: 2 },
  { level: 4, semester: 1, code: 'IMGT 466', name: 'Research Project', credits: 6 },

  { level: 4, semester: 2, code: 'IMGT 4213', name: 'Advanced Marketing Management', credits: 3 },
  { level: 4, semester: 2, code: 'IMGT 4222', name: 'Applied Econometrics', credits: 2 },
  { level: 4, semester: 2, code: 'IMGT 4234', name: 'Advanced Operations Research', credits: 4 },
  { level: 4, semester: 2, code: 'IMGT 4242', name: 'Strategic Business Analysis', credits: 2 },
  { level: 4, semester: 2, code: 'IMGT 4254', name: 'Industrial Training', credits: 4 },
  // INDT 4216 already added in ELTN

  // ==========================================
  // MATHEMATICS & STAT
  // ==========================================
  { level: 1, semester: 1, code: 'MATH 1112', name: 'Introduction to Mathematics I', credits: 2 },
  { level: 1, semester: 1, code: 'STAT 1113', name: 'Introduction to Probability and Statistics I', credits: 3 },

  { level: 1, semester: 2, code: 'MATH 1212', name: 'Introduction to Mathematics II', credits: 2 },
  { level: 1, semester: 2, code: 'MATH 1222', name: 'Differential Equations', credits: 2 },
  { level: 1, semester: 2, code: 'STAT 1213', name: 'Introduction to Probability and Statistics II', credits: 3 },

  { level: 2, semester: 1, code: 'MATH 2114', name: 'Linear Algebra I', credits: 4 },
  { level: 2, semester: 1, code: 'STAT 2112', name: 'Statistical Inference I', credits: 2 },

  { level: 2, semester: 2, code: 'MATH 2213', name: 'Linear Algebra II', credits: 3 },
  { level: 2, semester: 2, code: 'STAT 2212', name: 'Design of Experiments', credits: 2 },
  { level: 2, semester: 2, code: 'STAT 2222', name: 'Regression Analysis', credits: 2 },

  { level: 3, semester: 1, code: 'MATH 3114', name: 'Advanced Calculus', credits: 4 },
  { level: 3, semester: 1, code: 'MMOD 3113', name: 'Mathematical Methods', credits: 3 },
  { level: 3, semester: 1, code: 'MMOD 3124', name: 'Mathematical Models', credits: 4 },
  { level: 3, semester: 1, code: 'STAT 3112', name: 'Statistical Inference II', credits: 2 },
  { level: 3, semester: 1, code: 'STAT 3124', name: 'Time Series Analysis', credits: 4 },

  { level: 3, semester: 2, code: 'MATH 3214', name: 'Discrete Mathematics', credits: 4 },
  { level: 3, semester: 2, code: 'MMOD 3214', name: 'Numerical Methods', credits: 4 },
  { level: 3, semester: 2, code: 'MATH 3224', name: 'Applied Number Theory', credits: 4 },
  { level: 3, semester: 2, code: 'STAT 3212', name: 'Statistical Techniques', credits: 2 },
  { level: 3, semester: 2, code: 'STAT 3223', name: 'Operations Research', credits: 3 },
  { level: 3, semester: 2, code: 'STAT 3232', name: 'Data Analysis & Prep of Reports', credits: 2 },
  { level: 3, semester: 2, code: 'STAT 3243', name: 'Theory of Interest', credits: 3 },

  { level: 4, semester: 1, code: 'MATH 4114', name: 'Complex Variables', credits: 4 },
  { level: 4, semester: 1, code: 'MATH 4124', name: 'Functional Analysis', credits: 4 },
  { level: 4, semester: 1, code: 'MATS 416', name: 'Research Project', credits: 6 },
  { level: 4, semester: 1, code: 'MATS 428', name: 'Research Project', credits: 8 },
  { level: 4, semester: 1, code: 'STAT 4114', name: 'Stochastic Processes', credits: 4 },
  { level: 4, semester: 1, code: 'STAT 4124', name: 'Quality Control', credits: 4 },
  { level: 4, semester: 1, code: 'STAT 4134', name: 'Actuarial Mathematics', credits: 4 },

  { level: 4, semester: 2, code: 'MATH 4214', name: 'Partial Differential Equations', credits: 4 },
  { level: 4, semester: 2, code: 'MATH 4224', name: 'Measure Theory', credits: 4 },
  { level: 4, semester: 2, code: 'STAT 4214', name: 'Multivariate Analysis', credits: 4 },

  // ==========================================
  // ENGLISH (ELPC)
  // ==========================================
  // Conducted throughout the year, assigned to Semester 1 for entry purposes
  { level: 1, semester: 1, code: 'ELPC 110', name: 'English Language Proficiency Course I', credits: 0 },
  { level: 2, semester: 1, code: 'ELPC 220', name: 'English Language Proficiency Course II', credits: 0 }
];
