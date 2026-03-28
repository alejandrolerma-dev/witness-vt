import { useState } from 'react';
import { useSession } from './useSession';
import { processIncident, saveReport, retrieveReport, ApiError } from './api';

import LandingPage from './screens/LandingPage';
import DescribeIncidentScreen from './screens/DescribeIncidentScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import ReviewDocumenterScreen from './screens/ReviewDocumenterScreen';
import ReviewAdvisorScreen from './screens/ReviewAdvisorScreen';
import ReviewNavigatorScreen from './screens/ReviewNavigatorScreen';
import SaveConfirmScreen from './screens/SaveConfirmScreen';
import RetrievedReportScreen from './screens/RetrievedReportScreen';
import ErrorScreen from './screens/ErrorScreen';
import ExitScreen from './screens/ExitScreen';

export default function App() {
  const { status: sessionStatus, error: sessionError, sessionId, clearSession } = useSession();

  const [screen, setScreen] = useState('landing');
  const [rawText, setRawText] = useState('');
  const [structuredFields, setStructuredFields] = useState({});
  const [reportData, setReportData] = useState(null);
  const [retrievalToken, setRetrievalToken] = useState('');
  const [errorState, setErrorState] = useState(null);
  const [retrievedReport, setRetrievedReport] = useState(null);

  function handleExit() {
    clearSession();
    setRawText('');
    setStructuredFields({});
    setReportData(null);
    setRetrievalToken('');
    setErrorState(null);
    setRetrievedReport(null);
    setScreen('exit');
  }

  async function handleDescribeSubmit(text, fields) {
    setRawText(text);
    setStructuredFields(fields || {});
    setScreen('processing');
    try {
      const data = await processIncident(text, fields);
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

  async function handleRetrieve(token) {
    const result = await retrieveReport(token);
    if (result.error) {
      throw new Error(result.error);
    }
    setRetrievedReport(result);
    setScreen('retrieved');
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
          onRetrieve={handleRetrieve}
          onExit={handleExit}
          sessionStatus={sessionStatus}
          sessionError={sessionError}
        />
      );

    case 'describe':
      return (
        <DescribeIncidentScreen
          initialText={rawText}
          initialFields={structuredFields}
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
          onContinue={(editedRecord) => {
            setReportData(prev => ({ ...prev, incident_record: editedRecord }));
            setScreen('review_advisor');
          }}
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
          onHome={() => {
            setRawText('');
            setStructuredFields({});
            setReportData(null);
            setErrorState(null);
            setRetrievedReport(null);
            setScreen('landing');
          }}
          onDone={() => { clearSession(); setScreen('exit'); }}
        />
      );

    case 'retrieved':
      return (
        <RetrievedReportScreen
          report={retrievedReport}
          onBack={() => { setRetrievedReport(null); setScreen('landing'); }}
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
