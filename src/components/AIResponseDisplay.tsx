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
    
    // Split content into lines first, then group into sections
    const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line);
    
    const sections: JSX.Element[] = [];
    let currentSection: string[] = [];
    let sectionIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line is a section header (contains colon and is not a list item)
      if (line.includes(':') && !line.startsWith('•') && !line.startsWith('-') && !line.match(/^\d+\./)) {
        // Process previous section if it exists
        if (currentSection.length > 0) {
          sections.push(renderSection(currentSection, sectionIndex++));
          currentSection = [];
        }
        
        // Add header
        sections.push(
          <div key={`header-${sectionIndex}`} className="mb-3">
            <h4 className={`text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {line}
            </h4>
          </div>
        );
        sectionIndex++;
      } else {
        currentSection.push(line);
      }
    }
    
    // Process remaining section
    if (currentSection.length > 0) {
      sections.push(renderSection(currentSection, sectionIndex));
    }
    
    return sections;
  };

  const renderSection = (lines: string[], index: number) => {
    if (lines.length === 0) return null;
    
    // Check if all lines are list items
    const isListSection = lines.every(line => line.startsWith('•') || line.startsWith('-'));
    
    if (isListSection) {
      return (
        <ul key={`list-${index}`} className="space-y-2 mb-4">
          {lines.map((line, itemIndex) => {
            const cleanItem = line.replace(/^[-•]\s*/, '').trim();
            if (!cleanItem) return null;
            
            return (
              <li key={itemIndex} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-start leading-relaxed`}>
                <span className="mr-3 text-blue-400 font-bold mt-0.5">•</span>
                <span className="flex-1">{cleanItem}</span>
              </li>
            );
          }).filter(Boolean)}
        </ul>
      );
    }
    
    // Check if it's a numbered list
    const isNumberedList = lines.every(line => /^\d+\./.test(line));
    
    if (isNumberedList) {
      return (
        <ol key={`numbered-${index}`} className="space-y-2 mb-4">
          {lines.map((line, itemIndex) => {
            const cleanItem = line.replace(/^\d+\.\s*/, '').trim();
            if (!cleanItem) return null;
            
            return (
              <li key={itemIndex} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-start leading-relaxed`}>
                <span className="mr-3 text-blue-400 font-bold mt-0.5">{itemIndex + 1}.</span>
                <span className="flex-1">{cleanItem}</span>
              </li>
            );
          }).filter(Boolean)}
        </ol>
      );
    }
    
    // Regular paragraphs - check for key-value pairs
    return (
      <div key={`section-${index}`} className="space-y-3 mb-4">
        {lines.map((line, lineIndex) => {
          // Check if it's a key-value pair (contains colon but not at the end)
          if (line.includes(':') && !line.endsWith(':')) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();
            
            return (
              <div key={lineIndex} className="flex items-start justify-between py-1">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {key.trim()}:
                </span>
                <span className={`text-sm font-semibold ml-3 ${
                  value.includes('%') ? 'text-green-400' :
                  value.toUpperCase().includes('LOW') ? 'text-green-400' :
                  value.toUpperCase().includes('HIGH') ? 'text-red-400' :
                  value.toUpperCase().includes('MEDIUM') ? 'text-yellow-400' :
                  value.toUpperCase().includes('CRITICAL') ? 'text-red-500' :
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {value}
                </span>
              </div>
            );
          }
          
          // Regular paragraph
          return (
            <p key={lineIndex} className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`card-modern hover-lift animate-fade-in ${getTypeColor()} ${
      isDark ? 'bg-gray-800/80' : 'bg-white/90'
    } ${compact ? 'p-4' : 'p-6 sm:p-8'} backdrop-blur-xl`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl glass ${isDark ? 'bg-gray-700/30' : 'bg-gray-100/30'} animate-glow`}>
              {getTypeIcon()}
            </div>
            <div>
              <h4 className={`text-base font-bold text-gradient-primary`}>
                AI Analysis
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Assessment
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {confidence !== undefined && (
              <div className={`text-right p-3 rounded-xl glass ${isDark ? 'bg-gray-700/20' : 'bg-gray-100/20'}`}>
                <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Confidence</p>
                <p className={`text-lg font-bold ${getConfidenceColor(confidence)}`}>
                  {confidence.toFixed(1)}%
                </p>
              </div>
            )}
            
            {processingTime !== undefined && (
              <div className={`text-right p-3 rounded-xl glass ${isDark ? 'bg-gray-700/20' : 'bg-gray-100/20'}`}>
                <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Processing</p>
                <p className={`text-lg font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {processingTime.toFixed(2)}s
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`space-y-4 p-5 rounded-xl ${isDark ? 'bg-gray-900/30' : 'bg-gray-50/50'} backdrop-blur-sm border ${isDark ? 'border-gray-700/30' : 'border-gray-200/30'}`}>
        <div className="space-y-3">
          {formatContent(content)}
        </div>
      </div>

      {timestamp && (
        <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-700/30' : 'border-gray-200/30'}`}>
          <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Clock className="w-4 h-4" />
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
    <div className={`p-4 rounded-xl border transition-all duration-300 hover-lift ${
      isDark ? 'bg-gray-800/50 border-gray-600/50 backdrop-blur-xl' : 'bg-white/80 border-gray-200/50 backdrop-blur-xl'
    } shadow-lg hover:shadow-xl`}>
      {title && (
        <h5 className={`text-base font-semibold mb-3 text-gradient-primary`}>
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
            className={`mt-3 px-3 py-1 text-xs font-medium rounded-full transition-all duration-300 transform hover:scale-105 ${
              isDark 
                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      {props.confidence !== undefined && (
        <div className={`mt-4 pt-3 border-t ${isDark ? 'border-gray-700/30' : 'border-gray-200/30'} flex items-center justify-between`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              AI Confidence: <span className="text-gradient-success">{props.confidence.toFixed(1)}%</span>
            </span>
          </div>
          {props.processingTime !== undefined && (
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {props.processingTime.toFixed(2)}s
            </span>
          )}
        </div>
      )}
    </div>
  );
};

