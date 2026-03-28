import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    // Landing
    app_title: 'Witness',
    app_subtitle: 'You deserve to be heard. Safely.',
    anonymous_banner: '100% anonymous · No account needed · No personal info stored',
    step_document: 'Document',
    step_document_desc: 'Your words, structured into a clear record',
    step_understand: 'Understand',
    step_understand_desc: 'Know your rights under VT policy',
    step_act: 'Act',
    step_act_desc: 'Get a step-by-step path and draft statement',
    start_report: 'Start my report',
    preparing: 'Preparing…',
    identity_never_stored: 'Your identity is never recorded or stored',
    have_token: 'Have a retrieval token?',
    retrieve_saved: 'Retrieve a saved report',
    reports_filed: 'anonymous reports filed',
    view_trends: 'View trends →',
    leave_safely: 'Leave safely',
    // Describe
    what_happened: 'What happened?',
    describe_placeholder: 'Describe what happened and how it made you feel. You don\'t need to include anyone\'s name or personal details.',
    write_own_words: 'Write in your own words — no names needed',
    text_never_stored: 'Your text is never stored',
    voice: 'Voice',
    listening: 'Listening...',
    additional_details: 'Additional details',
    optional: 'optional',
    when_happened: 'When did this happen?',
    where_happened: 'Where did this happen?',
    witnesses: 'Were there witnesses?',
    yes: 'Yes',
    no: 'No',
    not_sure: 'Not sure',
    analyze_report: 'Analyze my report',
    // Processing
    analyzing: 'Analyzing your report',
    analyzing_desc: 'Our AI agents are working — this takes about 15 seconds',
    identity_protected: 'Your identity is protected throughout this process',
    // Review
    incident_record: 'Your incident record',
    your_rights: 'Your rights',
    your_next_steps: 'Your next steps',
    looks_right: 'This looks right — continue',
    see_reporting_path: 'See my reporting path',
    save_report: 'Save my report',
    exit_without_saving: 'Exit without saving',
    export_pdf: 'Export as PDF',
    back: 'Back',
    // Save
    report_saved: 'Report saved',
    retrieval_token: 'Your retrieval token',
    copy_token: 'Copy token',
    copied: '✓ Copied!',
    qr_screenshot: 'Or screenshot this QR code',
    auto_delete: 'This report will auto-delete after 90 days. Save your token to retrieve it before then.',
    return_home: 'Return to home',
    exit: 'Exit',
    // Processing agents
    agent_documenter: 'Structuring your incident record',
    agent_advisor: 'Identifying your rights under VT policy',
    agent_navigator: 'Building your reporting path',
    // Exit
    left_safely: 'You\'ve left safely',
    session_cleared: 'All session data has been cleared from this device. No personal information was stored.',
    close_tab: 'You can close this tab.',
  },
  es: {
    app_title: 'Witness',
    app_subtitle: 'Mereces ser escuchado/a. De forma segura.',
    anonymous_banner: '100% anónimo · Sin cuenta necesaria · Sin información personal',
    step_document: 'Documentar',
    step_document_desc: 'Tus palabras, estructuradas en un registro claro',
    step_understand: 'Entender',
    step_understand_desc: 'Conoce tus derechos según la política de VT',
    step_act: 'Actuar',
    step_act_desc: 'Obtén un plan paso a paso y una declaración',
    start_report: 'Iniciar mi reporte',
    preparing: 'Preparando…',
    identity_never_stored: 'Tu identidad nunca es registrada ni almacenada',
    have_token: '¿Tienes un token de recuperación?',
    retrieve_saved: 'Recuperar un reporte guardado',
    reports_filed: 'reportes anónimos presentados',
    view_trends: 'Ver tendencias →',
    leave_safely: 'Salir de forma segura',
    what_happened: '¿Qué pasó?',
    describe_placeholder: 'Describe lo que pasó y cómo te hizo sentir. No necesitas incluir nombres ni datos personales.',
    write_own_words: 'Escribe en tus propias palabras — sin nombres',
    text_never_stored: 'Tu texto nunca se almacena',
    voice: 'Voz',
    listening: 'Escuchando...',
    additional_details: 'Detalles adicionales',
    optional: 'opcional',
    when_happened: '¿Cuándo sucedió esto?',
    where_happened: '¿Dónde sucedió esto?',
    witnesses: '¿Hubo testigos?',
    yes: 'Sí',
    no: 'No',
    not_sure: 'No estoy seguro/a',
    analyze_report: 'Analizar mi reporte',
    analyzing: 'Analizando tu reporte',
    analyzing_desc: 'Nuestros agentes de IA están trabajando — esto toma unos 15 segundos',
    identity_protected: 'Tu identidad está protegida durante todo este proceso',
    incident_record: 'Tu registro de incidente',
    your_rights: 'Tus derechos',
    your_next_steps: 'Tus próximos pasos',
    looks_right: 'Esto se ve bien — continuar',
    see_reporting_path: 'Ver mi ruta de reporte',
    save_report: 'Guardar mi reporte',
    exit_without_saving: 'Salir sin guardar',
    export_pdf: 'Exportar como PDF',
    back: 'Atrás',
    report_saved: 'Reporte guardado',
    retrieval_token: 'Tu token de recuperación',
    copy_token: 'Copiar token',
    copied: '✓ ¡Copiado!',
    qr_screenshot: 'O haz captura de este código QR',
    auto_delete: 'Este reporte se eliminará automáticamente después de 90 días.',
    return_home: 'Volver al inicio',
    exit: 'Salir',
    agent_documenter: 'Estructurando tu registro de incidente',
    agent_advisor: 'Identificando tus derechos bajo la política de VT',
    agent_navigator: 'Construyendo tu ruta de reporte',
    left_safely: 'Has salido de forma segura',
    session_cleared: 'Todos los datos de sesión han sido eliminados de este dispositivo. Nada fue almacenado.',
    close_tab: 'Puedes cerrar esta pestaña.',
  },
  zh: {
    app_title: 'Witness',
    app_subtitle: '你值得被倾听。安全地。',
    anonymous_banner: '100%匿名 · 无需账户 · 不存储个人信息',
    step_document: '记录',
    step_document_desc: '将你的话语整理成清晰的记录',
    step_understand: '了解',
    step_understand_desc: '了解你在VT政策下的权利',
    step_act: '行动',
    step_act_desc: '获取逐步计划和声明草稿',
    start_report: '开始我的报告',
    preparing: '准备中…',
    identity_never_stored: '你的身份永远不会被记录或存储',
    have_token: '有检索令牌？',
    retrieve_saved: '检索已保存的报告',
    reports_filed: '份匿名报告已提交',
    view_trends: '查看趋势 →',
    leave_safely: '安全离开',
    what_happened: '发生了什么？',
    describe_placeholder: '描述发生了什么以及你的感受。你不需要包含任何人的姓名或个人信息。',
    write_own_words: '用你自己的话写——不需要姓名',
    text_never_stored: '你的文字永远不会被存储',
    voice: '语音',
    listening: '正在听...',
    additional_details: '额外详情',
    optional: '可选',
    when_happened: '这是什么时候发生的？',
    where_happened: '这是在哪里发生的？',
    witnesses: '有目击者吗？',
    yes: '是',
    no: '否',
    not_sure: '不确定',
    analyze_report: '分析我的报告',
    analyzing: '正在分析你的报告',
    analyzing_desc: '我们的AI代理正在工作——大约需要15秒',
    identity_protected: '在整个过程中你的身份都受到保护',
    incident_record: '你的事件记录',
    your_rights: '你的权利',
    your_next_steps: '你的下一步',
    looks_right: '看起来正确——继续',
    see_reporting_path: '查看我的报告路径',
    save_report: '保存我的报告',
    exit_without_saving: '不保存退出',
    export_pdf: '导出为PDF',
    back: '返回',
    report_saved: '报告已保存',
    retrieval_token: '你的检索令牌',
    copy_token: '复制令牌',
    copied: '✓ 已复制！',
    qr_screenshot: '或截图此二维码',
    auto_delete: '此报告将在90天后自动删除。',
    return_home: '返回首页',
    exit: '退出',
    agent_documenter: '正在整理你的事件记录',
    agent_advisor: '正在识别你在VT政策下的权利',
    agent_navigator: '正在构建你的报告路径',
    left_safely: '你已安全离开',
    session_cleared: '所有会话数据已从此设备清除。未存储任何内容。',
    close_tab: '你可以关闭此标签页。',
  },
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文' },
];

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageSwitcher() {
  const { lang, setLang, LANGUAGES } = useI18n();
  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`text-xs px-2.5 py-1.5 rounded-full font-medium transition-all ${
            lang === code
              ? 'bg-white/15 text-white border border-white/20'
              : 'text-white/30 hover:text-white/60'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
