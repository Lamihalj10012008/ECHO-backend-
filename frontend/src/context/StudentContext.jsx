import { createContext, useContext, useState } from "react";

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(() => {
    try {
      const saved = sessionStorage.getItem("echo_student");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const saveStudent = (data) => {
    sessionStorage.setItem("echo_student", JSON.stringify(data));
    setStudent(data);
  };

  const clearStudent = () => {
    sessionStorage.removeItem("echo_student");
    setStudent(null);
  };

  return (
    <StudentContext.Provider value={{ student, saveStudent, clearStudent }}>
      {children}
    </StudentContext.Provider>
  );
}

export const useStudent = () => useContext(StudentContext);
