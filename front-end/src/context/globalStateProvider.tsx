import React, { createContext, useContext, useState, Dispatch } from "react";
const AppContext = createContext({ 
    sortingBy: "first_name",
    sortingType: 'asc',
    filterBy: 'all',
    searchQuery: '',
    studentRollArray: [{}],
    setSearchQuery: {} as Dispatch<any>,
    setFilterBy: {} as Dispatch<any>,
    setSortingBy: {} as Dispatch<any>,
    setSortingType: {} as Dispatch<any>,
    setStudentRollArray: {} as Dispatch<any>
})

const AppStateProvider : React.FC = ({  children }) => {
    const [ sortingBy, setSortingBy] = useState<string>("first_name");
    const [ sortingType, setSortingType] = useState<string>('asc');
    const [studentRollArray, setStudentRollArray] = useState<any>([{}]);
    const [ searchQuery, setSearchQuery] = useState<string>('')
    const [ filterBy, setFilterBy] = useState<any>('all');
    return(
        <AppContext.Provider value={{ sortingBy, setSortingBy, sortingType, setSortingType, searchQuery, setSearchQuery, studentRollArray, setStudentRollArray, filterBy, setFilterBy}}>
            { children }
        </AppContext.Provider>
    )
}

export const useAppState = () => {
    const context = useContext(AppContext);
    return context;
}

export { AppContext, AppStateProvider };