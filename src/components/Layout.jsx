import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('hireready_sidebar_collapsed') === 'true';
  });

  const location = useLocation();

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('hireready_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="
      ai-background
      min-h-screen
      flex
      w-full
      overflow-hidden
    ">

      {/* Decorative Background Glow */}
      <div className="
        absolute
        top-20
        right-20
        w-96
        h-96
        rounded-full
        bg-indigo-500/10
        blur-[120px]
        pointer-events-none
      "/>

      <div className="
        absolute
        bottom-10
        left-40
        w-80
        h-80
        rounded-full
        bg-cyan-400/10
        blur-[120px]
        pointer-events-none
      "/>

      {/* Desktop Sidebar */}
      <aside className={`
        hidden
        lg:block
        relative
        z-20
        transition-all
        duration-300
        ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>
        <Sidebar 
          isCollapsed={isCollapsed} 
          onToggle={toggleCollapse} 
          className="w-full" 
        />
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="
          fixed
          inset-0
          z-40
          bg-black/30
          backdrop-blur-md
          lg:hidden
          "
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          w-64
          transform
          transition-transform
          duration-300
          lg:hidden
          ${mobileMenuOpen 
            ? "translate-x-0" 
            : "-translate-x-full"}
        `}
      >
        <Sidebar 
          isCollapsed={false} 
          onToggle={() => setMobileMenuOpen(false)} 
          className="w-full h-full" 
          isMobile={true} 
        />
      </div>





      {/* Main Area */}

      <div className="
        flex-1
        flex
        flex-col
        min-w-0
        relative
        z-10
      ">


        <Navbar 
          onMenuToggle={() =>
            setMobileMenuOpen(!mobileMenuOpen)
          }
        />



        <main
          className="
          flex-1
          overflow-x-hidden
          p-4
          lg:p-8
          "
        >

          <div
            className="
            mx-auto
            max-w-7xl
            "
          >

            <Outlet />

          </div>


        </main>


      </div>


    </div>

  );
}