import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  createdAt: string;
  onExpire?: () => void;
}

export const CountdownTimer = ({
  createdAt,
  onExpire,
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const transactionTime = new Date(createdAt).getTime();
      const expiryTime = transactionTime + 2 * 60 * 60 * 1000; // 2 jam dalam milliseconds
      const difference = expiryTime - now;

      if (difference <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        if (onExpire) {
          onExpire();
        }
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        hours,
        minutes,
        seconds,
        isExpired: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [createdAt, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Payment expired</span>
      </div>
    );
  }

  const formatTime = (value: number) => value.toString().padStart(2, "0");

  return (
    <div className="flex items-center space-x-2">
      <Clock className="h-4 w-4 text-orange-600" />
      <div className="text-sm">
        <span className="text-gray-700">Time left : </span>
        <span className=" font-bold text-orange-600">
          {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:
          {formatTime(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
};
