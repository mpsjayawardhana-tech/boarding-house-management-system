export type CurriculumSubject = {
  year: number;
  semester: string;
  area: string;
  code: string;
  name: string;
  credits: number;
};

export const curriculumData: CurriculumSubject[] = [
  { year: 1, semester: 'Semester 1', area: 'CMIS', code: 'CMIS 1113', name: 'Introduction to Computer Science', credits: 3 },
  { year: 1, semester: 'Semester 1', area: 'CMIS', code: 'CMIS 1123', name: 'Fundamentals of Programming', credits: 3 },
  { year: 1, semester: 'Semester 1', area: 'MATH', code: 'MATH 1113', name: 'Calculus I', credits: 3 },
  { year: 1, semester: 'Semester 1', area: 'MATH', code: 'MATH 1122', name: 'Vectors and Matrices', credits: 2 },
  { year: 1, semester: 'Semester 1', area: 'IMGT', code: 'IMGT 1113', name: 'Principles of Management', credits: 3 },
  { year: 1, semester: 'Semester 1', area: 'IMGT', code: 'IMGT 1122', name: 'Microeconomics', credits: 2 },
  { year: 1, semester: 'Semester 1', area: 'ELMN', code: 'ELMN 1113', name: 'Circuit Theory', credits: 3 },
  { year: 1, semester: 'Semester 1', area: 'ELMN', code: 'ELMN 1122', name: 'Analog Electronics', credits: 2 },
  { year: 1, semester: 'Semester 1', area: 'ENGL', code: 'ENGL 1112', name: 'English for Academic Purposes I', credits: 2 },
  { year: 1, semester: 'Semester 2', area: 'CMIS', code: 'CMIS 1213', name: 'Object-Oriented Programming', credits: 3 },
  { year: 1, semester: 'Semester 2', area: 'CMIS', code: 'CMIS 1222', name: 'Database Management Systems', credits: 2 },
  { year: 1, semester: 'Semester 2', area: 'MATH', code: 'MATH 1213', name: 'Calculus II', credits: 3 },
  { year: 1, semester: 'Semester 2', area: 'MATH', code: 'MATH 1222', name: 'Differential Equations', credits: 2 },
  { year: 1, semester: 'Semester 2', area: 'IMGT', code: 'IMGT 1213', name: 'Macroeconomics', credits: 3 },
  { year: 1, semester: 'Semester 2', area: 'IMGT', code: 'IMGT 1222', name: 'Financial Accounting', credits: 2 },
  { year: 1, semester: 'Semester 2', area: 'ELMN', code: 'ELMN 1213', name: 'Digital Electronics', credits: 3 },
  { year: 1, semester: 'Semester 2', area: 'ELMN', code: 'ELMN 1222', name: 'Measurements and Instrumentation', credits: 2 },
  { year: 1, semester: 'Semester 2', area: 'ENGL', code: 'ENGL 1212', name: 'English for Academic Purposes II', credits: 2 },
  { year: 2, semester: 'Semester 1', area: 'CMIS', code: 'CMIS 2113', name: 'Data Structures and Algorithms', credits: 3 },
  { year: 2, semester: 'Semester 1', area: 'CMIS', code: 'CMIS 2123', name: 'Operating Systems', credits: 3 },
  { year: 2, semester: 'Semester 1', area: 'MATH', code: 'MATH 2113', name: 'Linear Algebra', credits: 3 },
  { year: 2, semester: 'Semester 1', area: 'MATH', code: 'MATH 2122', name: 'Real Analysis', credits: 2 },
  { year: 2, semester: 'Semester 1', area: 'IMGT', code: 'IMGT 2113', name: 'Human Resource Management', credits: 3 },
  { year: 2, semester: 'Semester 1', area: 'IMGT', code: 'IMGT 2122', name: 'Marketing Management', credits: 2 },
  { year: 2, semester: 'Semester 2', area: 'CMIS', code: 'CMIS 2213', name: 'Software Engineering', credits: 3 },
  { year: 2, semester: 'Semester 2', area: 'CMIS', code: 'CMIS 2222', name: 'Computer Networks', credits: 2 },
  { year: 2, semester: 'Semester 2', area: 'MATH', code: 'MATH 2213', name: 'Mathematical Modeling', credits: 3 }
];
