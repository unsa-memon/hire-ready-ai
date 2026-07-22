import * as React from "react";
import { cn } from "../../lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `
      rounded-3xl

      border
      border-slate-200/70
      dark:border-slate-700/50

      bg-white/90
      dark:bg-slate-800/50

      text-slate-900
      dark:text-slate-100

      backdrop-blur-xl

      shadow-lg
      shadow-slate-300/20
      dark:shadow-black/20

      transition-all
      duration-300
      hover:shadow-xl
      `,
      className
    )}
    {...props}
  />
));

Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `
      flex
      flex-col
      space-y-2
      p-7
      `,
      className
    )}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      `
      text-xl
      font-bold
      tracking-tight

      text-slate-900
      dark:text-slate-100
      `,
      className
    )}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      `
      text-sm
      text-slate-600
      dark:text-slate-400
      `,
      className
    )}
    {...props}
  />
));

CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `
      p-7
      pt-0
      `,
      className
    )}
    {...props}
  />
));

CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `
      flex
      items-center
      p-7
      pt-0
      `,
      className
    )}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};