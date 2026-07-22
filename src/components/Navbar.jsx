import React from 'react';
import { Sun, Moon, Bell, Menu, User, LogOut } from 'lucide-react';
import { Button } from './ui/Button';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export function Navbar({ onMenuToggle }) {

  const { theme, toggleTheme } = useAppContext();
  const { logout, userProfile } = useAuth();

  return (
    <header 
      className="
      sticky 
      top-0 
      z-50 
      w-full

      border-b 
      border-border/40

      bg-background/50
      dark:bg-surface-900/40

      backdrop-blur-xl

      flex 
      items-center 
      justify-between

      px-4 
      h-16 
      lg:px-8

      shadow-sm

      transition-all 
      duration-300
      "
    >


      {/* Left Section */}
      <div className="flex items-center gap-4">


        {/* Mobile Menu */}
        <Button
          variant="ghost"
          size="icon"
          className="
          lg:hidden
          hover:bg-primary/10
          rounded-xl
          "
          onClick={onMenuToggle}
        >
          <Menu 
            size={22}
            className="text-foreground/80"
          />
        </Button>



        {/* Mobile Logo */}
   <Link 
  to="/"
  className="
flex 
items-center 
gap-3
"
>

  <div 
    className="
    w-9 
    h-9 
    rounded-xl

    bg-gradient-to-tr 
    from-indigo-500 
    to-cyan-500

    flex 
    items-center 
    justify-center

    text-white

    shadow-lg
    shadow-indigo-500/30
    "
  >

    <span className="
    font-black 
    text-lg
    ">
      H
    </span>

  </div>



          <div className="flex flex-col leading-tight">
            <span 
              className="
              font-extrabold
              text-base
              tracking-tight
              text-slate-900
              dark:text-white
              "
            >
              HireReady AI
            </span>

            <span 
              className="
              text-[10px]
              font-extrabold
              tracking-wider
              uppercase
              text-blue-600
              dark:text-blue-400
              "
            >
              Your AI-Powered Career Assistant
            </span>
          </div>


</Link>
      </div>





      {/* Right Section */}
      <div 
        className="
        flex 
        items-center 
        gap-3 
        lg:gap-5 
        ml-auto
        "
      >



        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="
          rounded-full
          hover:bg-primary/10
          "
        >

          {
            theme === 'dark'

            ?

            <Sun 
              size={20}
              className="
              text-amber-400
              drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]
              "
            />

            :

            <Moon 
              size={20}
              className="
              text-slate-700
              dark:text-slate-200
              "
            />

          }

        </Button>




        {/* Notification */}
        <Button
          variant="ghost"
          size="icon"
          className="
          relative
          rounded-full
          hover:bg-primary/10
          "
        >

          <Bell 
            size={20}
            className="text-foreground/80"
          />


          <span 
            className="
            absolute 
            top-2.5 
            right-2.5

            w-2 
            h-2

            bg-red-500

            rounded-full

            border-2 
            border-background

            animate-pulse
            "
          />

        </Button>




        {/* User Profile */}

        <div 
          className="
          flex 
          items-center 
          gap-3

          pl-3

          border-l 
          border-border/40
          "
        >


          <div

            title={userProfile?.full_name || 'User'}

            className="
            h-10 
            w-10

            rounded-full

            bg-gradient-to-tr 
            from-indigo-600 
            to-purple-600

            flex 
            items-center 
            justify-center

            text-white

            cursor-pointer

            ring-2 
            ring-indigo-500/30

            transition-all

            hover:ring-indigo-500
            hover:scale-105

            shadow-md
            shadow-indigo-500/20

            text-sm
            font-extrabold
            uppercase
            "
          >

            {
              userProfile?.full_name 
              ? 
              userProfile.full_name.charAt(0)
              :
              <User size={18}/>
            }


          </div>





          <Button

            variant="ghost"

            size="icon"

            onClick={logout}

            title="Logout"

            className="
            text-foreground/50

            hover:text-red-500

            rounded-full

            hover:bg-red-500/10

            transition-colors
            "

          >

            <LogOut size={18}/>

          </Button>



        </div>


      </div>


    </header>
  );
}