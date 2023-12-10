import { FC, MouseEventHandler, useContext } from "react";
import { GameContext } from "../context/GameContext";
import { ReadyState } from "react-use-websocket";

interface UsernameButtonProps {
  username: string;
  handleUsernameClick: MouseEventHandler<HTMLButtonElement>
  isSelected: boolean
}

export const UsernameButton: FC<UsernameButtonProps> = ({username, handleUsernameClick, isSelected}) => {
  const { readyState } = useContext(GameContext)
  
  return (
    <button 
      className={isSelected ? `rounded-sm w-full bg-noct-white opacity-50 font-semibold` 
                  : `rounded-sm w-full bg-noct-white hover:opacity-50 font-semibold`}
      disabled={readyState !== ReadyState.OPEN} 
      data-username={username} 
      onClick={handleUsernameClick}
      >
        {username}
    </button>
  )
}