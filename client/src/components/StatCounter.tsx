import { useCounter } from "@/hooks/use-counter";

interface StatCounterProps {
  value: string;
  isVisible: boolean;
  className?: string;
  testId?: string;
}

/**
 * Animated stat counter component
 * Extracts number from formatted string and animates it
 * Examples: "125+", "$3.2M+", "85+"
 */
export function StatCounter({ value, isVisible, className, testId }: StatCounterProps) {
  // Parse the number and format from the string
  const parseStatValue = (str: string) => {
    const match = str.match(/(\$)?(\d+\.?\d*)(M|K)?(\+)?/i);
    if (!match) return { prefix: '', number: 0, suffix: '' };
    
    const [, dollar = '', numStr = '0', multiplier = '', plus = ''] = match;
    const baseNum = parseFloat(numStr);
    const num = multiplier.toUpperCase() === 'M' ? baseNum : 
                multiplier.toUpperCase() === 'K' ? baseNum : baseNum;
    
    return {
      prefix: dollar,
      number: num,
      multiplier,
      suffix: plus,
    };
  };

  const { prefix, number, multiplier, suffix } = parseStatValue(value);
  const count = useCounter(number, 2000, isVisible);

  // Format the animated count
  const formatCount = (n: number) => {
    if (multiplier) {
      return n.toFixed(1);
    }
    return Math.floor(n).toString();
  };

  return (
    <span className={className} data-testid={testId}>
      {prefix}{formatCount(count)}{multiplier}{suffix}
    </span>
  );
}
