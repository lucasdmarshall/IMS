import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { motion } from 'framer-motion';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation and Common UI Elements
      dashboard: 'Dashboard',
      home: 'Home',
      products: 'Products',
      inventory: 'Inventory',
      stock: 'Stock',
      orders: 'Orders',
      users: 'Users',
      tasks: 'Tasks',
      profile: 'Profile',
      settings: 'Settings',
      notifications: 'Notifications',
      logout: 'Logout',

      // Order Management Page
      order_management: {
        title: 'Order Management',
        create_order: 'Create Order',
        update_order: 'Update Order',
        refresh: 'Refresh',
        back: 'Back',
        
        // Order Status
        status: {
          completed: 'Completed',
          processing: 'Processing',
          pending: 'Pending',
          cancelled: 'Cancelled'
        },
        
        // Order Statistics
        statistics: {
          completed_orders: 'Completed Orders',
          processing_orders: 'Processing Orders',
          pending_orders: 'Pending Orders',
          cancelled_orders: 'Cancelled Orders'
        },
        
        // Order Form Fields
        form: {
          customer_name: 'Customer Name',
          total_amount: 'Total Amount',
          payment_status: 'Payment Status',
          order_status: 'Order Status',
          description: 'Description',
          assigned_to: 'Assigned To',
          
          // Payment Status Options
          payment_status_options: {
            paid: 'Paid',
            unpaid: 'Unpaid',
            half_paid: 'Half Paid'
          }
        },
        
        // Notifications
        notifications: {
          order_created: 'Order created successfully',
          order_updated: 'Order updated successfully',
          order_deleted: 'Order deleted successfully',
          status_change_notification: 'Order status changed'
        }
      },

      // Authentication
      login: {
        failed: 'Login failed. Please try again.',
        invalid_role: 'Invalid user role'
      },

      // Theme and Preferences
      theme: {
        light_mode: 'Switch to Light Mode',
        dark_mode: 'Switch to Dark Mode'
      },

      // Language Selection
      language: {
        english: 'English',
        burmese: 'မြန်မာ (Burmese)'
      },

      // Error Handling
      errors: {
        not_found: 'Page Not Found',
        unauthorized: 'Unauthorized Access',
        server_error: 'Internal Server Error',
        report_fetch_failed: 'Failed to fetch reports'
      },

      // General UI
      actions: {
        create: 'Create',
        update: 'Update',
        delete: 'Delete',
        edit: 'Edit',
        cancel: 'Cancel',
        save: 'Save',
        close: 'Close',
        refresh: 'Refresh',
        export: 'Export',
        try_again: 'Try Again'
      },

      // Welcome Message
      welcome: 'Welcome',
      
      // Purchase Orders & Suppliers
      purchase_orders_suppliers: 'Supply',
      
      // Analysis
      analysis: 'Analysis',
      
      // Reports
      reports: {
        sales: 'Sales Report',
        stock: 'Stock Report',
        profit_loss: 'Profit & Loss Report',
        restricted_access: 'Restricted Access',
        profit_loss_restricted: 'Financial reports are only accessible to administrators. Please contact an admin if you need this information.',
        try_again: 'Try Again'
      },

      // General UI
      actions: {
        create: 'Create',
        update: 'Update',
        delete: 'Delete',
        edit: 'Edit',
        cancel: 'Cancel',
        save: 'Save',
        close: 'Close',
        refresh: 'Refresh',
        export: 'Export',
        try_again: 'Try Again'
      },
    }
  },
  my: {
    translation: {
      // Navigation and Common UI Elements
      dashboard: 'ဒက်ဘုတ်',
      home: 'မူလ',
      products: 'ထုတ်ကုန်များ',
      inventory: 'ကုန်ပစ္စည်းစာရင်း',
      stock: 'စတော့',
      orders: 'အမိန့်များ',
      users: 'အသုံးပြုသူများ',
      tasks: 'လုပ်ငန်းစဉ်များ',
      profile: 'ပရိုဖိုင်',
      settings: 'ဆက်တင်များ',
      notifications: 'အကြောင်းကြားချက်များ',
      logout: 'ထွက်ရန်',

      // Order Management Page
      order_management: {
        title: 'အမိန့်စီမံခန့်ခွဲမှု',
        create_order: 'အမိန့်ဖန်တီးရန်',
        update_order: 'အမိန့်အဆင့်မြှင့်တင်ရန်',
        refresh: 'refresh',
        back: 'နောက်သို့',
        
        // Order Status
        status: {
          completed: 'ပြီးစီး',
          processing: 'လုပ်ဆောင်နေ',
          pending: 'စောင့်ဆိုင်း',
          cancelled: 'ပယ်ဖျက်'
        },
        
        // Order Statistics
        statistics: {
          completed_orders: 'ပြီးစီးသည့် အမှာစာများ',
          processing_orders: 'လုပ်ဆောင်နေသည့် အမှာစာများ',
          pending_orders: 'စောင့်ဆိုင်းဆဲ အမှာစာများ',
          cancelled_orders: 'ပယ်ဖျက်သည့် အမှာစာများ'
        },
        
        // Order Form Fields
        form: {
          customer_name: 'ဝယ်သူအမည်',
          total_amount: 'စုစုပေါင်းပမာဏ',
          payment_status: 'ငွေပေးချေမှုအခြေအနေ',
          order_status: 'အမှာစာအခြေအနေ',
          description: 'အကြောင်းအရာ',
          assigned_to: 'တာဝန်ပေးထားသည်',
          
          // Payment Status Options
          payment_status_options: {
            paid: 'ပေးချေပြီး',
            unpaid: 'မပေးရသေး',
            half_paid: 'တစ်စိတ်တစ်ပိုင်း ပေးချေပြီး'
          }
        },
        
        // Notifications
        notifications: {
          order_created: 'အမှာစာဖန်တီးမှု အောင်မြင်ပါသည်',
          order_updated: 'အမှာစာအဆင့်မြှင့်တင်မှု အောင်မြင်ပါသည်',
          order_deleted: 'အမှာစာဖျက်သိမ်းမှု အောင်မြင်ပါသည်',
          status_change_notification: 'အမှာစာအခြေအနေပြောင်းလဲပြီး'
        }
      },

      // Authentication
      login: {
        failed: 'လော့ဂ်အင် မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ထပ်မံကြိုးစားပါ။',
        invalid_role: 'မမှန်ကန်သော အခန်း'
      },

      // Theme and Preferences
      theme: {
        light_mode: 'အလင်းမုဒ်သို့ပြောင်းရန်',
        dark_mode: 'မှောင်မုဒ်သို့ပြောင်းရန်'
      },

      // Language Selection
      language: {
        english: 'အင်္ဂလိပ်',
        burmese: 'မြန်မာ'
      },

      // Error Handling
      errors: {
        not_found: 'စာမျက်နှာမတွေ့ပါ',
        unauthorized: 'အတည်ပြုချက်မရှိ',
        server_error: 'ဆာဗာတွင် အမှားတစ်ခု ဖြစ်ပွားနေပါသည်',
        report_fetch_failed: 'စာရင်းများကို ရယူမှု မအောင်မြင်ပါ'
      },
      
      // Purchase Orders & Suppliers
      purchase_orders_suppliers: 'ဖြည့်တင်းရေး',
      
      // Analysis
      analysis: 'စာရင်းဇယား',
      
      // Reports
      reports: {
        sales: 'ရောင်းအားစာရင်း',
        stock: 'စတော့စာရင်း',
        profit_loss: 'အမြတ်အသက်စာရင်း'
      },

      // General UI
      actions: {
        create: 'ဖန်တီးရန်',
        update: 'အဆင့်မြှင့်တင်ရန်',
        delete: 'ဖျက်ရန်',
        edit: 'တည်းဖြတ်ရန်',
        cancel: 'မလုပ်တော့ပါ',
        save: 'သိမ်းရန်',
        close: 'ပိတ်ရန်'
      },

      // Welcome Message
      welcome: 'ကြိုဆိုပါသည်'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en', // Default to English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
