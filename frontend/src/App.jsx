import { useState } from 'react';
import { useSession } from './useSession';
import { processIncident, saveReport, ApiError } from './api';

import LandingPage from './screens/LandingPage';
import DescribeIncidentScreen from './screens/DescribeIncidentScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import ReviewDocumenterScreen from './screens/ReviewDocumenterScreen';
import ReviewAdvisorScreen from './screens/ReviewAdvisorScreen';
import ReviewNavigatorScreen from './screens/ReviewNavigatorScreen';
import SaveConfirmScreen from './screens/SaveConfirmScreen';
import ErrorScreen from './screens/ErrorScreen';
import ExitScreen from './screens/ExitScreen';

export default function App() {
  const { status: sessionStatus, error: sessionError, sessionId, clearSession } = useSession();

  const [screen, setScreen] = useState('landing');
  const [rawText, setRawText] = useState('');
  const [reportData, setReportData] = useState(null);
  const [retrievalToken, setRetrievalToken] = useState('');
  const [errorState, setErrorState] = useState(null);

  function handleExit() {
    clearSession();
    setRawText('');
    setReportData(null);
    setRetrievalToken('');
    setErrorState(null);
    setScreen('exit');
  }

  async function handleDescribeSubmit(text) {
    setRawText(text);
    setScreen('processing');
    try {
      const data = await processIncident(text);
      setReportData(data);
      setScreen('review_documenter');
    } catch (err) {
      setErrorState({
        message: err.message,
        partial: err instanceof ApiError ? (err.partial || null) : null,
      });
      setScreen('error');
    }
  }

  async function handleSave() {
    try {
      const result = await saveReport(
        reportData.incident_record,
        reportData.advice,
        reportData.navigation
      );
      setRetrievalToken(result.session_id || result.retrieval_token || result.token || '');
      setScreen('save_confirm');
    } catch {
      // Non-fatal — go to exit
      handleExit();
    }
  }

  switch (screen) {
    case 'landing':
      return (
        <LandingPage
          onStart={() => setScreen('describe')}
          onExit={handleExit}
          sessionStatus={sessionStatus}
          sessionError={sessionError}
        />
      );

    case 'describe':
      return (
        <DescribeIncidentScreen
          initialText={rawText}
          onSubmit={handleDescribeSubmit}
          onBack={() => setScreen('landing')}
          onExit={handleExit}
        />
      );

    case 'processing':
      return <ProcessingScreen onExit={handleExit} />;

    case 'review_documenter':
      return (
        <ReviewDocumenterScreen
          incidentRecord={reportData?.incident_record}
          onContinue={() => setScreen('review_advisor')}
          onBack={() => setScreen('describe')}
          onExit={handleExit}
        />
      );

    case 'review_advisor':
      return (
        <ReviewAdvisorScreen
          advice={reportData?.advice}
          onContinue={() => setScreen('review_navigator')}
          onBack={() => setScreen('review_documenter')}
          onExit={handleExit}
        />
      );

    case 'review_navigator':
      return (
        <ReviewNavigatorScreen
          navigation={reportData?.navigation}
          onSave={handleSave}
          onExitWithoutSaving={() => { clearSession(); setScreen('exit'); }}
          onBack={() => setScreen('review_advisor')}
          onExit={handleExit}
        />
      );

    case 'save_confirm':
      return (
        <SaveConfirmScreen
          retrievalToken={retrievalToken}
          onDone={() => { clearSession(); setScreen('exit'); }}
        />
      );

    case 'error':
      return (
        <ErrorScreen
          error={errorState?.message}
          partial={errorState?.partial}
          onRetry={() => { setErrorState(null); setScreen('describe'); }}
          onExit={handleExit}
        />
      );

    case 'exit':
    default:
      return <ExitScreen />;
  }
}
