import * as React from "react"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef(({ children, value, onValueChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || '')
  
  React.useEffect(() => {
    setSelectedValue(value || '')
  }, [value])

  const handleSelect = (newValue) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative" ref={ref} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value: selectedValue,
            onValueChange: handleSelect,
            isOpen,
            onToggle: handleToggle,
            setIsOpen,
          })
        }
        return child
      })}
    </div>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, children, value, isOpen, onToggle, setIsOpen, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggle}
      className={`flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ placeholder, value, ...props }, ref) => {
  const displayValue = value || placeholder;
  
  return (
    <span ref={ref} {...props}>
      {displayValue}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, isOpen, setIsOpen, onValueChange, ...props }, ref) => {
  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className={`absolute top-full left-0 z-50 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 ${className}`}
      {...props}
    >
      <div className="p-1">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onValueChange,
              setIsOpen,
            })
          }
          return child
        })}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value, onValueChange, setIsOpen, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        onValueChange?.(value)
        setIsOpen?.(false)
      }}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
