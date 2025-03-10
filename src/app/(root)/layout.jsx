import ResponsiveSidebar from "@/components/Sidebar";

export default function Layout({ children }) {
  return (
    <>
        <ResponsiveSidebar>{children}</ResponsiveSidebar>
    </>
  );
}
