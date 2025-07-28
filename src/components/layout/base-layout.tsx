import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import React from "react";

interface BaseLayoutProps {
    showHeader?: boolean;
    showFooter?: boolean;
    children: React.ReactNode;
    variant?: "default" | "admin";
    title?: string;
    showAuth?: boolean;
    showMobileNav?: boolean;
    showThemeToggle?: boolean;

}

export default function BaseLayout({
    children,
    showHeader = true,
    showFooter = true,
    variant = "default",
    title = "EDUMENTUM",
    showAuth = true,
}: BaseLayoutProps) {
    return (
        <React.Fragment>
            {showHeader && <Header variant={variant} title={title} showAuth={showAuth} />}
            <main>{children}</main>
            {showFooter && <Footer />}
        </React.Fragment>
    );
}
