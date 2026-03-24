import { ComHeader } from "./components/ComHeader";

export default function HeaderHomePage() {
  const handleToggle = () => {
    console.log("Sidebar toggled!");
  };
  
  return <ComHeader toggleSidebar={handleToggle} />;
}