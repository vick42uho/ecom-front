import "../../globals.css";
import SideBar from "./components/SideBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

        <div className="flex gap-2">
          <div>
            <SideBar /> 
          </div>
          <div className="w-full mr-15">
            {children}
          </div>
        </div>
    
  );
}
