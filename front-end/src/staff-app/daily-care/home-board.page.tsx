import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { RollInput } from "shared/models/roll"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { useAppState } from "context/globalStateProvider"
import { Switch } from "@material-ui/core"
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "react-router-dom"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [rollStatusData, setRollStatusData] = useState({ all: 0, present: 0, late: 0, absent: 0 })
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [setStudentsApi] = useApi<{ student: RollInput }>({ url: "save-roll" })
  const { sortingBy, sortingType, searchQuery, setStudentRollArray, studentRollArray, filterBy } = useAppState()
  const navigate = useNavigate()
  useEffect(() => {
    void getStudents()
  }, [getStudents])

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    } else if (action === "complete") {
      saveRoll()
    }
  }

  const saveRoll = () => {
    studentRollArray?.forEach((studentRoll: any) => {
      if (studentRoll.roll_status !== "unmark") {
        let studentRollState = {
          student_roll_states: {
            student_id: studentRoll.student_id,
            roll_status: studentRoll.roll_status,
          },
        }
        setStudentsApi(studentRollState)
        setIsRollMode(false)
        navigate("/staff/activity")
      }
    })
  }

  useEffect(() => {
    const allRollStatsData = findStudentRollStats()
    setRollStatusData(allRollStatsData)
  }, [studentRollArray])

  const findStudentRollStats = () => {
    return {
      all: studentRollArray?.length,
      present: studentRollArray?.filter((s: any) => s.roll_status === "present").length,
      late: studentRollArray?.filter((s: any) => s.roll_status === "late").length,
      absent: studentRollArray?.filter((s: any) => s.roll_status === "absent").length,
    }
  }

  useEffect(() => {
    if (isRollMode) {
      let studentArray = []
      if (data?.students) {
        for (let student of data?.students) {
          studentArray.push({ student_id: student.id, roll_status: "unmark" })
        }
      }
      setStudentRollArray(studentArray)
    } else {
      let studentArray: any = []
      setStudentRollArray(studentArray)
    }
  }, [isRollMode])

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && data?.students && (
          <>
            {data.students
              .sort((a, b) => {
                if (sortingType === "asc" && (sortingBy === "first_name" || sortingBy === "last_name")) {
                  return a[sortingBy].toLowerCase() > b[sortingBy].toLowerCase() ? 1 : -1
                }
                return (sortingBy === "first_name" || sortingBy === "last_name") && a[sortingBy].toLowerCase() < b[sortingBy].toLowerCase() ? 1 : -1
              })
              .filter((each) => {
                if ((each.first_name + each.last_name).toLowerCase().includes(searchQuery.toLowerCase())) {
                  return true
                }
                return false
              })
              .filter((each) => {
                if (isRollMode) {
                  const studentRollStatus: any = studentRollArray.find((student: any) => student.student_id === each.id)
                  if (studentRollStatus?.roll_status === filterBy) {
                    return true
                  } else if (filterBy === "all") {
                    return true
                  } else {
                    return false
                  }
                } else {
                  return true
                }
              })
              .map((s: any) => (
                <StudentListTile
                  key={s.id}
                  isRollMode={isRollMode}
                  student={s}
                  initState={(studentRollArray as any)?.find((studentRoll: any) => studentRoll.student_id === s.id)?.roll_status}
                ></StudentListTile>
              ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} rollStatusData={rollStatusData} />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick } = props
  const { sortingType, setSortingType, sortingBy, setSortingBy, searchQuery, setSearchQuery } = useAppState()
  return (
    <S.ToolbarContainer>
      <div>
        <Button onClick={() => (sortingType === "asc" ? setSortingType("desc") : setSortingType("asc"))}>
          <FontAwesomeIcon icon={sortingType === "asc" ? faArrowUp : faArrowDown} />
        </Button>
        <span> {sortingType === "asc" ? "asc.." : "des.."}</span>
        <span>{sortingBy === "first_name" ? "(FirstName)" : "(LastName)"}</span>
        <Switch color='primary' checked={sortingBy === "first_name" ? true : false} onChange={() => (sortingBy === "first_name" ? setSortingBy("last_name") : setSortingBy("first_name"))} />
      </div>
      <S.SearchContainer>
        <input placeholder="search name here" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </S.SearchContainer>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  SearchContainer: styled.div`
    background-color: white;
    border-radius: 5px;
    padding: 5px;
    > input {
      outline: none;
      border: none;
    }
  `,
}
