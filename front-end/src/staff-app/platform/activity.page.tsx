import React, { useEffect } from "react"
import styled from "styled-components"
import { Spacing, BorderRadius } from "shared/styles/styles"
import { useApi } from "shared/hooks/use-api"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Colors } from "shared/styles/colors"
import { RolllStateType } from "shared/models/roll"

export const ActivityPage: React.FC = () => {
  const [getStudents, data, loadState] = useApi<{ activity: any }>({ url: "get-activities" })

  useEffect(() => {
    getStudents()
  }, [])

  return (
    <S.Container>
      <h4> Activity Page </h4>
      <S.ActivityToolbar>
        <span>Name</span>
        <span>Completed Date</span>
        <span>Roll Status</span>
      </S.ActivityToolbar>
      {loadState === "loading" && (
        <CenteredContainer>
          <FontAwesomeIcon icon="spinner" size="2x" spin />
        </CenteredContainer>
      )}
      {loadState === "loaded" &&
        data?.activity.map((list: any, i: number) => {
          const { entity } = list
          return (
            <S.Activity key={i}>
              <span>{entity.name}</span>
              <span>{entity.completed_at.split("T")[0]}</span>
              <S.Icon size={20} border={entity.student_roll_states.roll_state === "unmark"} bgColor={getBgColor(entity.student_roll_states.roll_status)}>
                <FontAwesomeIcon icon="check" size={"lg"} />
              </S.Icon>
            </S.Activity>
          )
        })}

      {loadState === "error" && (
        <CenteredContainer>
          <div>Failed to load</div>
        </CenteredContainer>
      )}
    </S.Container>
  )
}

function getBgColor(type: RolllStateType) {
  switch (type) {
    case "unmark":
      return "#fff"
    case "present":
      return "#13943b"
    case "absent":
      return "#9b9b9b"
    case "late":
      return "#f5a623"
    default:
      return "#13943b"
  }
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 0;
  `,
  ActivityToolbar: styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0 10px 0 10px;
    align-items: center;
    border-radius: 5px;
    font-weight: 600;
    flex-wrap: wrap;
    height: 40px;
    background-color: #343f64;
    color: #fff;
  `,
  Activity: styled.div<{ key?: number }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    border-radius: 5px;
    background-color: #fff;
    margin-top: 10px;
    padding: 0 10px 0 10px;
    color: #3a415d;
    font-weight: 400;
  `,
  Icon: styled.div<{ size: number; border: boolean; bgColor: string }>`
    color: #fff;
    background-color: ${({ bgColor }) => bgColor};
    border: 2px solid ${({ border }) => (border ? Colors.dark.lighter : "transparent")};
    border-radius: ${BorderRadius.rounded};
    width: ${({ size }) => size}px;
    height: ${({ size }) => size}px;
    margin-bottom: 10px;
  `,
}
