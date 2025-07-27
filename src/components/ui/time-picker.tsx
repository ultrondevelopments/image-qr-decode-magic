import * as React from "react"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  const minuteOptions = []
  for (let i = 0; i < 60; i += 15) {
    minuteOptions.push(i.toString().padStart(2, '0'))
  }

  const hourOptions = []
  for (let i = 0; i < 24; i++) {
    hourOptions.push(i.toString().padStart(2, '0'))
  }

  const [selectedHour, setSelectedHour] = React.useState(
    date ? date.getHours().toString().padStart(2, '0') : '12'
  )
  const [selectedMinute, setSelectedMinute] = React.useState(
    date ? Math.floor(date.getMinutes() / 15) * 15 : 0
  )

  React.useEffect(() => {
    if (date) {
      setSelectedHour(date.getHours().toString().padStart(2, '0'))
      setSelectedMinute(Math.floor(date.getMinutes() / 15) * 15)
    }
  }, [date])

  const handleTimeSelect = (hour: string, minute: number) => {
    setSelectedHour(hour)
    setSelectedMinute(minute)
    
    if (date) {
      const newDate = new Date(date)
      newDate.setHours(parseInt(hour), minute, 0, 0)
      setDate(newDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {date ? `${selectedHour}:${selectedMinute.toString().padStart(2, '0')}` : "Pick a time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="space-y-2">
            <Label>Hour</Label>
            <div className="grid grid-cols-6 gap-1">
              {hourOptions.map((hour) => (
                <Button
                  key={hour}
                  variant={selectedHour === hour ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeSelect(hour, selectedMinute)}
                  className="h-8"
                >
                  {hour}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label>Minute</Label>
            <div className="grid grid-cols-4 gap-1">
              {minuteOptions.map((minute) => (
                <Button
                  key={minute}
                  variant={selectedMinute === parseInt(minute) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeSelect(selectedHour, parseInt(minute))}
                  className="h-8"
                >
                  {minute}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}