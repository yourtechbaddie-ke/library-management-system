import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Midnight Library | The Art of Discovery",description:"A considered digital library for books, readers and discovery."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
