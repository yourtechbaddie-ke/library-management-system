import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Page & Co. | Library Workspace",description:"A calm, modern workspace for managing books, readers and circulation."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}