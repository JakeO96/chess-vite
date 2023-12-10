import { ReadyState } from "react-use-websocket";
import { GameContext } from "../context/GameContext";
import { FC, MouseEventHandler, useContext } from "react";
import { UsernameButton } from "./UsernameButton";

interface UserListProps {
  users: string[]
  handleUsernameClick: MouseEventHandler<HTMLButtonElement>
  selectedUsername: string;
}

export const UserList: FC<UserListProps> = ({ users, handleUsernameClick, selectedUsername }) => {
  return (
    <>
      {
        users.length > 0 ? (
            <div className="border-[1px] border-noct-white p-4 w-44 h-72 max-h-72 justify-center rounded">
              <ul>
                {users.map((username) => (
                  <li key={username} className="text-center">
                    <UsernameButton 
                      username={username}
                      handleUsernameClick={handleUsernameClick}
                      isSelected={username === selectedUsername}
                    />
                    <hr/>
                  </li>
                ))}
              </ul>
            </div>
        ) : (
          <p>No users logged in</p>
        )
      }
    </>
  )
} 