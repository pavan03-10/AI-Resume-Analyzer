import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent outline-none transition-all",
        "focus-visible:ring-3 focus-visible:ring-violet-500/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[size=default]:h-6 data-[size=default]:w-11",
        "data-[size=sm]:h-5 data-[size=sm]:w-9",
        "data-[checked]:bg-violet-600",
        "data-[unchecked]:bg-slate-300",
        "dark:data-[checked]:bg-violet-500",
        "dark:data-[unchecked]:bg-slate-700",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-sm",
          "transition-transform duration-200 ease-in-out",
          "data-[size=default]:h-5 data-[size=default]:w-5",
          "data-[size=sm]:h-4 data-[size=sm]:w-4",
          "group-data-[size=default]/switch:translate-x-0.5",
          "group-data-[size=default]/switch:data-[checked]:translate-x-[22px]",
          "group-data-[size=sm]/switch:translate-x-0.5",
          "group-data-[size=sm]/switch:data-[checked]:translate-x-[18px]"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };