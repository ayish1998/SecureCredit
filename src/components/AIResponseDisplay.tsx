import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { AlertCircle, Clock, TrendingUp, Shield, Brain } from 'lucide-react';

interface AIResponseDisplayProps {
  content: string;
  confidence?: number;
  type?: 'fraud' | 'credit' | 'security' | 'general';
  timestamp?: Date;
  processingTime?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export const AIResponseDisplay: React.FC<AIResponseDisplayProps> = ({
  content,
  confidence,
  type = 'general',
  timestamp,
  processingTime,
  showHeader = true,
  compact = false
}) => {
  const { isDark } = useTheme();

  const getTypeIcon = () => {
    switch (type) {
      case 'fraud':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'credit':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'security':
        return <Shield className="w-5 h-5 text-blue-400" />;
      default:
        return <Brain className="w-5 h-5 text-purple-400" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'fraud':
        return 'border-red-500/20 bg-red-500/5';
      case 'credit':
        return 'border-green-500/20 bg-green-500/5';
      case 'security':
        return 'border-blue-500/20 bg-blue-500/5';
      default:
        return 'border-purple-500/20 bg-purple-500/5';
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 90) return 'text-green-400';
    if (conf >= 70) return 'text-yellow-400';
    if (conf >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const formatContent = (text: string) => {
    // Clean up the text first - remove asterisks and fix formatting
    let cleanText = text
      .replace(/\*+/g, '') // Remove asterisks
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .trim();
    
    // Split content into paragraphs and format
    const paragraphs = cleanText.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      
      // Skip empty paragraphs
      if (!trimmedParagraph) return null;
      
      // Check if it's a list item
      if (trimmedParagraph.startsWith('-') || trimmedParagraph.startsWith('•')) {
        const items = paragraph.split('\n').filter(item => item.trim() && item.replace(/^[-•]\s*/, '').trim());
        if (items.length === 0) return null; // Skip empty lists
        
        return (
          <ul key={index} className="space-y-1 ml-4">
            {items.map((item, itemIndex) => {
              const cleanItem = item.replace(/^[-•]\s*/, '').trim();
              if (!cleanItem) return null;
              
              return (
                <li key={itemIndex} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-start`}>
                  <span className="mr-2 text-blue-400">•</span>
                  <span>{cleanItem}</span>
                </li>
              );
            }).filter(Boolean)}
          </ul>
        );
      }
      
      // Check if it's a numbered list
      if (/^\d+\./.test(trimmedParagraph)) {
        const items = paragraph.split('\n').filter(item => item.trim() && item.replace(/^\d+\.\s*/, '').trim());
        if (items.length === 0) return null; // Skip empty lists
        
        return (
          <ol key={index} className="space-y-1 ml-4">
            {items.map((item, itemIndex) => {
              const cleanItem = item.replace(/^\d+\.\s*/, '').trim();
              if (!cleanItem) return null;
              
              return (
                <li key={itemIndex} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-start`}>
                  <span className="mr-2 text-blue-400 font-medium">{itemIndex + 1}.</span>
                  <span>{cleanItem}</span>
                </li>
              );
            }).filter(Boolean)}
          </ol>
        );
      }
      
      // Check if it's a section header (ends with colon)
      if (trimmedParagraph.endsWith(':')) {
        return (
          <h4 key={index} className={`text-sm font-semibold mt-3 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {trimmedParagraph}
          </h4>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {trimmedParagraph}
        </p>
      );
    }).filter(Boolean); // Remove null entries
  };

  return (
    <div className={`rounded-xl border transition-colors duration-300 ${getTypeColor()} ${
      isDark ? 'bg-gray-800/50' : 'bg-white/50'
    } ${compact ? 'p-3' : 'p-4 sm:p-6'}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
              {getTypeIcon()}
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI Analysis
              </h4>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Assessment
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {confidence !== undefined && (
              <div className="text-right">
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Confidence</p>
                <p className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
                  {confidence.toFixed(1)}%
                </p>
              </div>
            )}
            
            {processingTime !== undefined && (
              <div className="text-right">
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Processing</p>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {processingTime.toFixed(2)}s
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {formatContent(content)}
      </div>

      {timestamp && (
        <div className="mt-4 pt-3 border-t border-gray-200/20">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{timestamp.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact version for lists and cards
export const AIResponseCard: React.FC<Omit<AIResponseDisplayProps, 'showHeader' | 'compact'> & { 
  title?: string;
  maxLength?: number;
}> = ({ content, title, maxLength = 300, ...props }) => {
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Clean up content and handle truncation better
  const cleanContent = content
    .replace(/\*+/g, '') // Remove asterisks
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines
    .trim();
  
  const shouldTruncate = cleanContent.length > maxLength;
  const displayContent = shouldTruncate && !isExpanded 
    ? cleanContent.substring(0, maxLength).replace(/\s+\S*$/, '') + '...' 
    : cleanContent;

  return (
    <div className={`p-3 rounded-lg border transition-colors duration-300 ${
      isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
    }`}>
      {title && (
        <h5 className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h5>
      )}
      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
        {displayContent.split('\n').map((line, index) => (
          <p key={index} className={index > 0 ? 'mt-1' : ''}>
            {line.trim()}
          </p>
        ))}
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`mt-2 text-xs underline ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      {props.confidence !== undefined && (
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            AI Confidence: {props.confidence.toFixed(1)}%
          </span>
          {props.processingTime !== undefined && (
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {props.processingTime.toFixed(2)}s
            </span>
          )}
        </div>
      )}
    </div>
  );
};

