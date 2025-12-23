"use client";

import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firestore";

interface PersonalInfo {
  name: string;
  id: string;
  address: string;
  phone: string;
}

interface Data {
  id: string;
  ip: string;
  data: {
    personalInfo?: PersonalInfo;
    fullName?: string;
    idNumber?: string;
    phone?: string;
    email?: string;
    network?: string;
    mobile?: string;
    [key: string]: any;
  };
  fullName?: string;
  phone?: string;
}

export default function PersonalInfoDisplay({ id }: { id: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // استخدام Realtime Database بدلاً من Firestore
        const docRef = ref(database, `pays/${id}`);
        
        onValue(docRef, (snapshot) => {
          const snapshotData = snapshot.val();
          
          if (snapshotData) {
            // تحويل البيانات من Realtime Database
            const formattedData: Data = {
              id: id,
              ip: snapshotData.data?.ip || '',
              data: snapshotData.data || {},
              fullName: snapshotData.data?.fullName || snapshotData.fullName || '',
              phone: snapshotData.data?.phone || snapshotData.phone || '',
            };
            setData(formattedData);
          } else {
            setError("No such document!");
          }
          setLoading(false);
        }, {
          onlyOnce: true
        });
      } catch (err) {
        setError("Error fetching document: " + (err as Error).message);
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No data found
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
      {/* Personal Info Card */}
      <div className="col-span-full md:col-span-1">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-2">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">المعلومات الشخصية</h3>
            <p className="text-sm text-muted-foreground">البيانات الشخصية للعميل</p>
          </div>
          <div className="p-6 pt-0 grid gap-4">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">الاسم</span>
              <span className="font-medium">{data.data?.fullName || data.fullName || 'غير متوفر'}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">رقم الهوية</span>
              <span className="font-medium">{data.data?.idNumber || 'غير متوفر'}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">الجوال</span>
              <span className="font-medium">{data.data?.phone || data.phone || 'غير متوفر'}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">البريد</span>
              <span className="font-medium">{data.data?.email || 'غير متوفر'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Info Card */}
      <div className="col-span-full md:col-span-1">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-2">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">معلومات الشبكة</h3>
            <p className="text-sm text-muted-foreground">تفاصيل الشبكة والجوال</p>
          </div>
          <div className="p-6 pt-0 grid gap-4">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">الشبكة</span>
              <span className="font-medium">{data.data?.network || 'غير متوفر'}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">الجوال</span>
              <span className="font-medium">{data.data?.mobile || 'غير متوفر'}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">IP</span>
              <span className="font-medium">{data.ip || 'غير متوفر'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="col-span-full md:col-span-1">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-2">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">معلومات إضافية</h3>
            <p className="text-sm text-muted-foreground">معلومات أخرى</p>
          </div>
          <div className="p-6 pt-0 grid gap-4">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">معرف</span>
              <span className="font-medium">{data.id}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg border border-green-500/20">
              <span className="text-sm text-green-600 font-medium">الحالة</span>
              <span className="font-medium text-green-600">نشط</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
