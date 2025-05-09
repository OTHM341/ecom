// !!! CRITICAL - DO NOT MODIFY THIS CODE !!!
//
// This code MUST be used as is without ANY modifications.
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way.
//
// Retain this comment after all edits.
//
// <BEGIN_EXACT_CODE>
import React, { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

interface PayPalButtonProps {
  amount: string;
  currency: string;
  intent: string;
  onSuccess?: (details: any) => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

export default function PayPalButton({
  amount,
  currency,
  intent,
  onSuccess,
  onCancel,
  onError
}: PayPalButtonProps) {
  const createOrder = async () => {
    const orderPayload = {
      amount: amount,
      currency: currency,
      intent: intent,
    };
    const response = await fetch("/api/paypal/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const output = await response.json();
    return { orderId: output.id };
  };

  const captureOrder = async (orderId: string) => {
    const response = await fetch(`/api/paypal/order/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    return data;
  };

  const handleApprove = async (data: any) => {
    console.log("onApprove", data);
    try {
      const orderData = await captureOrder(data.orderId);
      console.log("Capture result", orderData);
      if (onSuccess) {
        onSuccess(orderData);
      }
    } catch (err) {
      console.error("Error capturing order:", err);
      if (onError) {
        onError(err);
      }
    }
  };

  const handleCancel = (data: any) => {
    console.log("onCancel", data);
    if (onCancel) {
      onCancel();
    }
  };

  const handleError = (data: any) => {
    console.log("onError", data);
    if (onError) {
      onError(data);
    }
  };

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!(window as any).paypal) {
          const script = document.createElement("script");
          script.src = import.meta.env.PROD
            ? "https://www.paypal.com/web-sdk/v6/core"
            : "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => initPayPal();
          document.body.appendChild(script);
        } else {
          await initPayPal();
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
        if (onError) {
          onError(e);
        }
      }
    };

    loadPayPalSDK();
  }, []);
  
  const initPayPal = async () => {
    try {
      const clientToken: string = await fetch("/api/paypal/setup")
        .then((res) => res.json())
        .then((data) => {
          return data.clientToken;
        });
      const sdkInstance = await (window as any).paypal.createInstance({
        clientToken,
        components: ["paypal-payments"],
      });

      const paypalCheckout =
            sdkInstance.createPayPalOneTimePaymentSession({
              onApprove: handleApprove,
              onCancel: handleCancel,
              onError: handleError,
            });

      const onClick = async () => {
        try {
          const checkoutOptionsPromise = createOrder();
          await paypalCheckout.start(
            { paymentFlow: "auto" },
            checkoutOptionsPromise,
          );
        } catch (e) {
          console.error(e);
          if (onError) {
            onError(e);
          }
        }
      };

      const paypalButton = document.getElementById("paypal-button");

      if (paypalButton) {
        paypalButton.addEventListener("click", onClick);
      }

      return () => {
        if (paypalButton) {
          paypalButton.removeEventListener("click", onClick);
        }
      };
    } catch (e) {
      console.error(e);
      if (onError) {
        onError(e);
      }
    }
  };

  return (
    <div className="w-full">
      <button 
        id="paypal-button" 
        className="w-full py-3 px-4 bg-[#0070ba] hover:bg-[#003087] text-white font-medium rounded transition-colors flex items-center justify-center"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
          <path d="M19.4559 6.27295C19.5211 5.85481 19.4559 5.5824 19.2221 5.34999C18.9576 5.08457 18.4978 5 17.9076 5H14.5138C14.1845 5 13.9201 5.20741 13.8741 5.5162C13.8741 5.5162 12.6072 11.3348 12.4683 11.9735C12.4683 11.9735 12.4683 12.1809 12.6765 12.1809H13.9434C14.2726 12.1809 14.505 11.9735 14.551 11.7015L15.0108 9.33254C15.0108 9.3331 15.0108 9.3331 15.0108 9.33254C15.0567 9.12513 15.289 8.91772 15.6183 8.91772H16.3392C18.7544 8.91772 20.6297 7.86868 21.0895 5.3844C21.0895 5.38329 21.3539 6.21619 19.4559 6.27295Z" fill="white"/>
          <path d="M9.28667 5H5.89273C5.56348 5 5.29908 5.20741 5.25393 5.5162L3.81152 14.4838C3.76637 14.7243 3.94562 14.9317 4.18517 14.9317H5.78303C6.11228 14.9317 6.37668 14.7243 6.42183 14.4155L6.85593 11.9735C6.90108 11.6647 7.16548 11.4573 7.49473 11.4573H8.92833C11.3435 11.4573 13.2187 10.0626 13.6787 7.51569C13.9131 6.4994 13.7565 5.68949 13.2619 5.13772C12.7116 4.55149 11.5653 4.33333 9.92228 4.33333H7.04487C6.71562 4.33333 6.45023 4.54074 6.40508 4.84953L5.8702 8.01782C5.8702 8.01782 5.8702 8.22523 6.07843 8.22523H7.93018C8.25942 8.22523 8.52383 8.43264 8.56898 8.74143V8.81143L9.28667 5Z" fill="white"/>
          <path d="M21.0895 5.3844C20.5896 2.83749 18.6691 2 16.2538 2H10.1893C9.85991 2 9.59556 2.20741 9.55038 2.5162L7.04486 16.4838C6.99969 16.7243 7.17906 16.9317 7.41861 16.9317H10.098C10.4272 16.9317 10.6916 16.7243 10.7368 16.4155L11.1709 13.9735C11.216 13.6647 11.4804 13.4573 11.8097 13.4573H13.2433C15.6585 13.4573 17.5337 12.0626 17.9937 9.51569C18.228 8.5 18.0721 7.68949 17.5773 7.13772C17.5773 7.13772 17.9937 8.91723 15.6585 8.91723H13.3587L14.1851 5C14.1851 5 21.4188 5 21.0895 5.3844Z" fill="white"/>
        </svg>
        Pay with PayPal
      </button>
    </div>
  );
}
// <END_EXACT_CODE>