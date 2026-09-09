/**
 * Native Bridge for Tara Voice Assistant - Android APK & Web Compatibility
 * Handles telecom intents (answer call, reject call, make WhatsApp call, announce caller)
 * seamlessly in both Android WebView APK (via @JavascriptInterface) and Web Browser (simulation).
 */

export interface NativeCallState {
  hasIncomingCall: boolean;
  callerName?: string;
  callerNumber?: string;
  isCallActive: boolean;
  callType?: 'phone' | 'whatsapp';
  startTime?: number;
}

export interface TelecomActionResult {
  success: boolean;
  action: string;
  message: string;
  nativeHandled: boolean;
  details?: Record<string, any>;
}

type CallStateListener = (state: NativeCallState) => void;

class NativeBridgeService {
  private callState: NativeCallState = {
    hasIncomingCall: false,
    isCallActive: false,
  };

  private listeners: CallStateListener[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      // Expose globally so Android Native Java/Kotlin code can communicate back
      (window as any).TaraNativeBridge = {
        onIncomingCall: (name: string, number: string, type: 'phone' | 'whatsapp' = 'phone') => {
          this.triggerIncomingCall(name, number, type);
        },
        onCallEnded: () => {
          this.endCall();
        },
        getCallState: () => this.callState,
      };
    }
  }

  public getCallState(): NativeCallState {
    return { ...this.callState };
  }

  public subscribe(listener: CallStateListener): () => void {
    this.listeners.push(listener);
    listener(this.getCallState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const state = this.getCallState();
    this.listeners.forEach((l) => l(state));
  }

  /**
   * Check if running in an Android WebView wrapper with native bridge injected
   */
  public isAndroidNative(): boolean {
    if (typeof window === 'undefined') return false;
    const w = window as any;
    return !!(w.AndroidBridge || w.AndroidTelecom || (w.Capacitor && w.Capacitor.isNativePlatform?.()));
  }

  /**
   * Trigger simulated incoming call (useful for testing voice commands like "phone uthao" or "call kaat do")
   */
  public triggerIncomingCall(
    callerName: string = 'राहुल शर्मा (Rahul Sharma)',
    callerNumber: string = '+91 98765 43210',
    type: 'phone' | 'whatsapp' = 'phone'
  ) {
    this.callState = {
      hasIncomingCall: true,
      callerName,
      callerNumber,
      isCallActive: false,
      callType: type,
    };
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([300, 200, 300, 200, 500]);
      } catch {}
    }
    this.notify();
  }

  /**
   * Alias for triggerIncomingCall
   */
  public simulateIncomingCall(
    callerName: string = 'राहुल शर्मा (Rahul Sharma)',
    callerNumber: string = '+91 98765 43210',
    type: 'phone' | 'whatsapp' = 'phone'
  ) {
    this.triggerIncomingCall(callerName, callerNumber, type);
  }

  /**
   * Action: answer_call ("phone uthao", "call receive karo")
   */
  public async answerCall(): Promise<TelecomActionResult> {
    const w = window as any;

    // 1. Check native Android Telecom bridge
    if (w.AndroidBridge?.answerCall) {
      try {
        w.AndroidBridge.answerCall();
        this.callState = {
          ...this.callState,
          hasIncomingCall: false,
          isCallActive: true,
          startTime: Date.now(),
        };
        this.notify();
        return {
          success: true,
          action: 'answer_call',
          message: 'कॉल उठा ली गई है (Native Android Call Answered)',
          nativeHandled: true,
        };
      } catch (err: any) {
        console.warn('Native AndroidBridge.answerCall error:', err);
      }
    }

    // 2. Web fallback / simulation
    if (this.callState.hasIncomingCall) {
      this.callState = {
        ...this.callState,
        hasIncomingCall: false,
        isCallActive: true,
        startTime: Date.now(),
      };
      this.notify();
      return {
        success: true,
        action: 'answer_call',
        message: `जी, ${this.callState.callerName || 'कॉल'} प्राप्त कर ली गई है।`,
        nativeHandled: false,
        details: { callerName: this.callState.callerName },
      };
    }

    return {
      success: true,
      action: 'answer_call',
      message: 'जी, कॉल रिसीव करने की कमांड भेजी गई है।',
      nativeHandled: false,
    };
  }

  /**
   * Action: reject_call ("call kaat do", "cut karo", "call disconnect karo")
   */
  public async rejectCall(): Promise<TelecomActionResult> {
    const w = window as any;

    // 1. Native Android Telecom bridge
    if (w.AndroidBridge?.rejectCall || w.AndroidBridge?.endCall) {
      try {
        if (w.AndroidBridge.rejectCall) w.AndroidBridge.rejectCall();
        else w.AndroidBridge.endCall();

        this.callState = {
          hasIncomingCall: false,
          isCallActive: false,
        };
        this.notify();
        return {
          success: true,
          action: 'reject_call',
          message: 'कॉल काट दी गई है (Native Call Disconnected)',
          nativeHandled: true,
        };
      } catch (err: any) {
        console.warn('Native AndroidBridge.rejectCall error:', err);
      }
    }

    // 2. Web fallback / simulation
    const prevCaller = this.callState.callerName;
    this.callState = {
      hasIncomingCall: false,
      isCallActive: false,
    };
    this.notify();

    return {
      success: true,
      action: 'reject_call',
      message: prevCaller 
        ? `जी, ${prevCaller} की कॉल काट दी गई है।`
        : 'जी, कॉल काट दी गई है।',
      nativeHandled: false,
    };
  }

  /**
   * Action: make_whatsapp_call ("Rahul ko WhatsApp call lagao")
   */
  public async makeWhatsAppCall(contactName: string, phoneNumber?: string): Promise<TelecomActionResult> {
    const cleanName = (contactName || '').trim();
    const cleanNumber = (phoneNumber || '').replace(/[^0-9+]/g, '');
    const w = window as any;

    // 1. Native Android bridge intent
    if (w.AndroidBridge?.makeWhatsAppCall) {
      try {
        w.AndroidBridge.makeWhatsAppCall(cleanName, cleanNumber);
        return {
          success: true,
          action: 'make_whatsapp_call',
          message: `WhatsApp पर ${cleanName} को कॉल लगाई जा रही है...`,
          nativeHandled: true,
          details: { contactName: cleanName, phoneNumber: cleanNumber },
        };
      } catch (err: any) {
        console.warn('Native AndroidBridge.makeWhatsAppCall error:', err);
      }
    }

    // 2. Web browser intent (WhatsApp URI scheme or web link)
    if (typeof window !== 'undefined') {
      const targetUrl = cleanNumber
        ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent('नमस्ते! तारा असिस्टेंट के माध्यम से संपर्क')}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(`नमस्ते ${cleanName}! तारा असिस्टेंट के माध्यम से संपर्क`)}`;

      try {
        // Try opening custom scheme or tab
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // Fallback
      }
    }

    return {
      success: true,
      action: 'make_whatsapp_call',
      message: `जी, ${cleanName || 'संपर्क'} को WhatsApp कॉल लगाई जा रही है।`,
      nativeHandled: false,
      details: { contactName: cleanName, phoneNumber: cleanNumber },
    };
  }

  /**
   * Action: make_phone_call ("Rahul ko call lagao")
   */
  public async makePhoneCall(contactName: string, phoneNumber?: string): Promise<TelecomActionResult> {
    const cleanName = (contactName || '').trim();
    const cleanNumber = (phoneNumber || '').replace(/[^0-9+]/g, '') || '9876543210';
    const w = window as any;

    // 1. Native Android bridge
    if (w.AndroidBridge?.makePhoneCall) {
      try {
        w.AndroidBridge.makePhoneCall(cleanName, cleanNumber);
        return {
          success: true,
          action: 'make_phone_call',
          message: `${cleanName} को फ़ोन कॉल मिलाई जा रही है...`,
          nativeHandled: true,
          details: { contactName: cleanName, phoneNumber: cleanNumber },
        };
      } catch (err: any) {
        console.warn('Native AndroidBridge.makePhoneCall error:', err);
      }
    }

    // 2. Web browser tel URI
    if (typeof window !== 'undefined') {
      try {
        window.location.href = `tel:${cleanNumber}`;
      } catch {}
    }

    return {
      success: true,
      action: 'make_phone_call',
      message: `जी, ${cleanName || cleanNumber} को फ़ोन कॉल मिलाई जा रही है।`,
      nativeHandled: false,
      details: { contactName: cleanName, phoneNumber: cleanNumber },
    };
  }

  /**
   * Action: announce_caller ("kaun call kar raha hai")
   */
  public async announceCaller(callerInfo?: string): Promise<TelecomActionResult> {
    const caller = callerInfo || this.callState.callerName || 'अज्ञात कॉलर (Unknown Caller)';
    const phone = this.callState.callerNumber || '';

    return {
      success: true,
      action: 'announce_caller',
      message: `${caller} ${phone ? `(${phone})` : ''} की कॉल आ रही है। क्या आप फोन उठाना चाहते हैं?`,
      nativeHandled: this.isAndroidNative(),
      details: { caller, phone },
    };
  }

  public endCall() {
    this.callState = {
      hasIncomingCall: false,
      isCallActive: false,
    };
    this.notify();
  }
}

export const nativeBridge = new NativeBridgeService();
