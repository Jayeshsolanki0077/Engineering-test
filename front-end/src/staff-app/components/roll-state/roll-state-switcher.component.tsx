import React, { useState } from "react"
import { RolllStateType } from "shared/models/roll"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component";
import { useAppState } from "context/globalStateProvider";

interface Props {
  initialState?: RolllStateType
  size?: number
  onStateChange?: (newState: RolllStateType) => void;
  studentId:number;
}
export const RollStateSwitcher: React.FC<Props> = ({ initialState = "unmark", size = 40, onStateChange, studentId }) => {
  const [rollState, setRollState] = useState(initialState)
  const  { setStudentRollArray } = useAppState();

  const nextState = () => {
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (rollState === "unmark" || rollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === rollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const updateRollStatus = (next:any) => {
    setStudentRollArray((prevState:any) => {
      let updatedRollStats:any = [];
      for( let i=0; i<prevState.length; i++) {
        if(prevState[i].student_id === studentId) {
          updatedRollStats.push({
            student_id: prevState[i].student_id,
            roll_status: next
          })
        } else {
          updatedRollStats.push(prevState[i])
        }
      }
      return updatedRollStats; 
    })
  }

  const onClick = () => {
    const next = nextState()
    setRollState(next)
    updateRollStatus(next);
    if (onStateChange) {
      onStateChange(next)
    }
  }

  return <RollStateIcon type={rollState} size={size} onClick={onClick} />
}
