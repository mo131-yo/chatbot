import AddToCartButton from "../cart-inside/components/AddtoCartButton";
import { LogoTemp, MenuToggle, NavActions } from "./components";


interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header = ({ toggleSidebar }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-black/6 dark:border-white/6 bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <MenuToggle onClick={toggleSidebar} />
        <LogoTemp />
      </div>
      <AddToCartButton productId={""}/>
      <NavActions />
    </header>
  );
};