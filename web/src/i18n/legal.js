/**
 * 星阑文化 · 法律文本（三语）
 * 结构：{ updated, disclaimer: { title, intro, sections:[{h,p:[…]}], footer }, refund: {…}, consent: {…} }
 */

const zhCN = {
  updated: '2026年10月28日',
  disclaimer: {
    title: '免责声明',
    intro: '欢迎访问本网站。本网站提供周易八卦、八字命理、易经占卜、五行分析及相关传统文化内容。请在使用本网站之前仔细阅读以下免责声明。访问、浏览或使用本网站，即表示您已阅读并理解本声明。',
    sections: [
      {
        h: '一、仅供娱乐与文化研究',
        p: [
          '本网站提供的所有占卜结果、命理分析、运势预测、卦象解读及相关文字内容，均仅用于娱乐、个人反思及中国传统文化学习与研究。',
          '本网站所提供的内容不构成科学结论，也不保证能够准确预测未来、判断个人命运或确定任何事件的发生结果。',
        ],
      },
      {
        h: '二、不构成专业建议',
        p: [
          '本网站的任何内容均不构成医疗、心理咨询、法律、财务、投资、税务、商业或其他专业建议。',
          '涉及健康、婚姻、感情、职业、财务及其他重大人生决定时，请结合实际情况独立判断，并在必要时咨询具备相应资质的专业人士。',
        ],
      },
      {
        h: '三、预测结果不作保证',
        p: [
          '由于命理分析、传统占卜及相关解读具有主观性，不同的分析方法可能产生不同的解释。本网站不对占卜结果的准确性、完整性、可靠性或适用性作出任何明示或默示的保证。',
          '本网站不保证任何预测、建议或分析能够实现特定结果，包括但不限于婚姻、感情、事业、财富、健康及个人运势方面的结果。',
        ],
      },
      {
        h: '四、用户自行承担决策责任',
        p: [
          '用户应对自身的判断、选择及行为负责。任何因参考、理解或使用本网站内容而作出的决定，均应由用户根据自身情况独立评估。',
          '请勿仅依据占卜结果决定是否结婚、离婚、分手、投资、辞职、接受或拒绝医疗治疗，或作出其他可能对自身及他人产生重大影响的决定。',
        ],
      },
      {
        h: '五、责任限制',
        p: [
          '在适用法律允许的最大范围内，本网站运营方不对用户因使用本网站、参考占卜结果或依赖相关内容而产生的间接损失、附带损失、特殊损失或后果承担责任。',
          '本条款不排除或限制任何适用法律规定不得排除或限制的责任。',
        ],
      },
      {
        h: '六、个人信息与隐私',
        p: [
          '如用户在使用本网站时提交出生日期、出生时间、出生地点或其他个人信息，本网站将依据适用的隐私政策及相关法律处理这些信息。',
          '请勿在本网站提交密码、身份证件号码、银行账户信息或其他不必要的敏感个人信息。',
        ],
      },
      {
        h: '七、第三方服务与外部链接',
        p: [
          '本网站可能包含第三方网站链接、工具或服务。对于第三方网站的内容、服务可用性及其隐私处理方式，请以相应第三方的条款和政策为准。',
        ],
      },
      {
        h: '八、免责声明的修改',
        p: [
          '本网站保留在适用法律允许的范围内修改本免责声明的权利。修改后的声明将在本网站公布，并在适用情况下注明更新日期。',
        ],
      },
      {
        h: '九、联系我们',
        p: ['如您对本免责声明有任何疑问，请通过本网站公布的联系方式与我们联系。'],
      },
    ],
    footer: '重要提示：本网站所有占卜及命理分析内容仅供娱乐与传统文化研究参考，不应被视为对未来事件的确定性预测。',
  },
  refund: {
    title: '退款政策',
    intro: '本政策适用于本网站全部付费数字服务。请在付款前仔细阅读。',
    sections: [
      {
        h: '一、用户自愿付费',
        p: [
          '本网站提供周易八卦、八字命理、易经占卜及相关分析服务。所有付费服务均由用户自主选择并自愿购买。',
          '用户在付款前应仔细阅读本退款政策，并确认理解相关服务内容及退款规则。',
        ],
      },
      {
        h: '二、数字服务生成后不予退款',
        p: [
          '本网站提供的占卜结果、命理分析及相关解读属于数字化服务。',
          '由于相关服务具有即时生成和数字内容交付的特点，一旦用户完成付款，且系统已经开始生成或已经生成并向用户提供占卜结果、命理分析或其他数字内容，原则上不予退款。',
          '用户不得仅因对占卜结果不满意、认为预测不准确、改变主意或个人期望未得到满足而要求退款。',
        ],
      },
      {
        h: '三、付款前确认',
        p: [
          '在付款前，用户有责任确认所选服务及其价格，并阅读本网站的退款政策。',
          '提交付款即表示用户确认已阅读并理解本退款政策，并自愿购买相关服务。',
        ],
      },
      {
        h: '四、例外情况',
        p: [
          '如发生重复扣款、未能交付已购买的服务、经核实的系统故障，或适用法律要求退款的其他情形，本网站将根据实际情况及适用法律进行处理。',
          '本政策不排除或限制消费者依据适用法律享有的不可放弃的权利。',
        ],
      },
      { h: '五、联系我们', p: ['如您对付款或退款有任何疑问，请通过本网站公布的联系方式与我们联系。'] },
    ],
    footer: '提示：付款前会要求您勾选确认已阅读并同意本退款政策。',
  },
  consent: {
    title: '使用前请确认',
    lead: '点击「同意」即表示您已阅读并理解上述《免责声明》与《退款政策》，并自愿购买相关数字服务。',
    agree: '同意，继续',
    disagree: '不同意',
    agreed: '已记录您的同意，可以继续支付。',
    refused: '未同意则无法完成付款；您仍可免费浏览本网站的其他内容。',
    backHome: '返回首页',
  },
};

const zhTW = {
  updated: '2026年10月28日',
  disclaimer: {
    title: '免責聲明',
    intro: '歡迎訪問本網站。本網站提供周易八卦、八字命理、易經占卜、五行分析及相關傳統文化內容。請在使用本網站之前仔細閱讀以下免責聲明。訪問、瀏覽或使用本網站，即表示您已閱讀並理解本聲明。',
    sections: [
      {
        h: '一、僅供娛樂與文化研究',
        p: [
          '本網站提供的所有占卜結果、命理分析、運勢預測、卦象解讀及相關文字內容，均僅用於娛樂、個人反思及中國傳統文化學習與研究。',
          '本網站所提供的內容不構成科學結論，也不保證能夠準確預測未來、判斷個人命運或確定任何事件的發生結果。',
        ],
      },
      {
        h: '二、不構成專業建議',
        p: [
          '本網站的任何內容均不構成醫療、心理諮詢、法律、財務、投資、稅務、商業或其他專業建議。',
          '涉及健康、婚姻、感情、職業、財務及其他重大人生決定時，請結合實際情況獨立判斷，並在必要時諮詢具備相應資質的專業人士。',
        ],
      },
      {
        h: '三、預測結果不作保證',
        p: [
          '由於命理分析、傳統占卜及相關解讀具有主觀性，不同的分析方法可能產生不同的解釋。本網站不對占卜結果的準確性、完整性、可靠性或適用性作出任何明示或默示的保證。',
          '本網站不保證任何預測、建議或分析能夠實現特定結果，包括但不限於婚姻、感情、事業、財富、健康及個人運勢方面的結果。',
        ],
      },
      {
        h: '四、用戶自行承擔決策責任',
        p: [
          '用戶應對自身的判斷、選擇及行為負責。任何因參考、理解或使用本網站內容而作出的決定，均應由用戶根據自身情況獨立評估。',
          '請勿僅依據占卜結果決定是否結婚、離婚、分手、投資、辭職、接受或拒絕醫療治療，或作出其他可能對自身及他人產生重大影響的決定。',
        ],
      },
      {
        h: '五、責任限制',
        p: [
          '在適用法律允許的最大範圍內，本網站營運方不對用戶因使用本網站、參考占卜結果或依賴相關內容而產生的間接損失、附帶損失、特殊損失或後果承擔責任。',
          '本條款不排除或限制任何適用法律規定不得排除或限制的責任。',
        ],
      },
      {
        h: '六、個人資訊與隱私',
        p: [
          '如用戶在使用本網站時提交出生日期、出生時間、出生地點或其他個人資訊，本網站將依據適用的隱私政策及相關法律處理這些資訊。',
          '請勿在本網站提交密碼、身分證件號碼、銀行帳戶資訊或其他不必要的敏感個人資訊。',
        ],
      },
      {
        h: '七、第三方服務與外部連結',
        p: ['本網站可能包含第三方網站連結、工具或服務。對於第三方網站的內容、服務可用性及其隱私處理方式，請以相應第三方的條款和政策為準。'],
      },
      { h: '八、免責聲明的修改', p: ['本網站保留在適用法律允許的範圍內修改本免責聲明的權利。修改後的聲明將在本網站公布，並在適用情況下註明更新日期。'] },
      { h: '九、聯絡我們', p: ['如您對本免責聲明有任何疑問，請透過本網站公布的聯絡方式與我們聯絡。'] },
    ],
    footer: '重要提示：本網站所有占卜及命理分析內容僅供娛樂與傳統文化研究參考，不應被視為對未來事件的確定性預測。',
  },
  refund: {
    title: '退款政策',
    intro: '本政策適用於本網站全部付費數位服務。請在付款前仔細閱讀。',
    sections: [
      {
        h: '一、用戶自願付費',
        p: [
          '本網站提供周易八卦、八字命理、易經占卜及相關分析服務。所有付費服務均由用戶自主選擇並自願購買。',
          '用戶在付款前應仔細閱讀本退款政策，並確認理解相關服務內容及退款規則。',
        ],
      },
      {
        h: '二、數位服務生成後不予退款',
        p: [
          '本網站提供的占卜結果、命理分析及相關解讀屬於數位化服務。',
          '由於相關服務具有即時生成和數位內容交付的特點，一旦用戶完成付款，且系統已經開始生成或已經生成並向用戶提供占卜結果、命理分析或其他數位內容，原則上不予退款。',
          '用戶不得僅因對占卜結果不滿意、認為預測不準確、改變主意或個人期望未得到滿足而要求退款。',
        ],
      },
      {
        h: '三、付款前確認',
        p: [
          '在付款前，用戶有責任確認所選服務及其價格，並閱讀本網站的退款政策。',
          '提交付款即表示用戶確認已閱讀並理解本退款政策，並自願購買相關服務。',
        ],
      },
      {
        h: '四、例外情況',
        p: [
          '如發生重複扣款、未能交付已購買的服務、經核實的系統故障，或適用法律要求退款的其他情形，本網站將根據實際情況及適用法律進行處理。',
          '本政策不排除或限制消費者依據適用法律享有的不可放棄的權利。',
        ],
      },
      { h: '五、聯絡我們', p: ['如您對付款或退款有任何疑問，請透過本網站公布的聯絡方式與我們聯絡。'] },
    ],
    footer: '提示：付款前會要求您勾選確認已閱讀並同意本退款政策。',
  },
  consent: {
    title: '使用前請確認',
    lead: '點擊「同意」即表示您已閱讀並理解上述《免責聲明》與《退款政策》，並自願購買相關數位服務。',
    agree: '同意，繼續',
    disagree: '不同意',
    agreed: '已記錄您的同意，可以繼續支付。',
    refused: '未同意則無法完成付款；您仍可免費瀏覽本網站的其他內容。',
    backHome: '返回首頁',
  },
};

const en = {
  updated: '28 October 2026',
  disclaimer: {
    title: 'Disclaimer',
    intro: 'Welcome. This website provides I Ching (Zhouyi) divination, Bazi destiny analysis, Yi Jing casting, Five Elements analysis and related traditional-culture content. Please read this Disclaimer carefully before use. By accessing, browsing or using this site, you confirm that you have read and understood it.',
    sections: [
      {
        h: '1. Entertainment and cultural study only',
        p: [
          'All divination results, destiny analyses, fortune forecasts, hexagram readings and related text on this site are provided solely for entertainment, personal reflection, and the study of traditional Chinese culture.',
          'The content is not a scientific conclusion and does not guarantee accurate prediction of the future, of any individual’s fate, or of the outcome of any event.',
        ],
      },
      {
        h: '2. Not professional advice',
        p: [
          'Nothing on this site constitutes medical, psychological, legal, financial, investment, tax, business or any other professional advice.',
          'For decisions about health, marriage, relationships, career, finances or other major life matters, please exercise your own judgement and consult a properly qualified professional where necessary.',
        ],
      },
      {
        h: '3. No guarantee of results',
        p: [
          'Metaphysical analysis and traditional divination are interpretive by nature, and different methods may produce different readings. We make no express or implied warranty as to the accuracy, completeness, reliability or fitness for purpose of any reading.',
          'We do not guarantee that any prediction, suggestion or analysis will produce a particular outcome, including outcomes related to marriage, relationships, career, wealth, health or personal fortune.',
        ],
      },
      {
        h: '4. You are responsible for your decisions',
        p: [
          'You are responsible for your own judgement, choices and actions. Any decision made in reliance on this site’s content must be independently evaluated by you in light of your own circumstances.',
          'Do not decide whether to marry, divorce, separate, invest, resign, accept or refuse medical treatment, or take any other decision with significant impact on yourself or others, solely on the basis of a divination result.',
        ],
      },
      {
        h: '5. Limitation of liability',
        p: [
          'To the maximum extent permitted by applicable law, the operator of this site is not liable for indirect, incidental, special or consequential loss arising from use of the site, reliance on any reading, or dependence on related content.',
          'Nothing in this clause excludes or limits liability that cannot be excluded or limited under applicable law.',
        ],
      },
      {
        h: '6. Personal information and privacy',
        p: [
          'Where you submit a birth date, birth time, birth place or other personal information, we process it in accordance with our privacy policy and applicable law.',
          'Please do not submit passwords, identity document numbers, bank account details or other unnecessary sensitive personal information.',
        ],
      },
      {
        h: '7. Third-party services and links',
        p: ['This site may link to third-party websites, tools or services. Their content, availability and privacy practices are governed by their own terms and policies.'],
      },
      {
        h: '8. Changes to this Disclaimer',
        p: ['We reserve the right to amend this Disclaimer to the extent permitted by applicable law. The amended version will be published on this site with an updated date where applicable.'],
      },
      { h: '9. Contact us', p: ['If you have questions about this Disclaimer, please contact us using the details published on this site.'] },
    ],
    footer: 'Important: all divination and destiny analysis on this site is for entertainment and traditional-culture study only, and must not be treated as a definitive prediction of future events.',
  },
  refund: {
    title: 'Refund Policy',
    intro: 'This policy applies to all paid digital services on this site. Please read it before paying.',
    sections: [
      {
        h: '1. Voluntary purchase',
        p: [
          'This site offers I Ching divination, Bazi destiny analysis, Yi Jing casting and related analyses. All paid services are chosen and purchased voluntarily by the user.',
          'Before paying, you should read this Refund Policy carefully and confirm that you understand the service and these rules.',
        ],
      },
      {
        h: '2. No refunds once digital content is generated',
        p: [
          'Readings, destiny analyses and interpretations provided by this site are digital services.',
          'Because these services are generated instantly and delivered as digital content, once payment is completed and the system has begun generating, or has generated and delivered, the reading or other digital content, refunds are in principle not available.',
          'A refund will not be granted merely because you are dissatisfied with a reading, consider a prediction inaccurate, change your mind, or feel your expectations were not met.',
        ],
      },
      {
        h: '3. Confirm before paying',
        p: [
          'Before paying, it is your responsibility to confirm the selected service and its price, and to read this Refund Policy.',
          'Submitting payment confirms that you have read and understood this Refund Policy and voluntarily purchase the service.',
        ],
      },
      {
        h: '4. Exceptions',
        p: [
          'Where there is a duplicate charge, failure to deliver a purchased service, a verified system fault, or any other circumstance in which applicable law requires a refund, we will handle the matter in light of the facts and applicable law.',
          'This policy does not exclude or limit any consumer right that cannot be waived under applicable law.',
        ],
      },
      { h: '5. Contact us', p: ['If you have questions about payment or refunds, please contact us using the details published on this site.'] },
    ],
    footer: 'Note: before payment you will be asked to tick a box confirming that you have read and agreed to this Refund Policy.',
  },
  consent: {
    title: 'Before you continue',
    lead: 'By clicking “Agree” you confirm that you have read and understood the Disclaimer and Refund Policy above, and that you voluntarily purchase the digital service.',
    agree: 'Agree and continue',
    disagree: 'Do not agree',
    agreed: 'Your consent is recorded — you can continue to payment.',
    refused: 'Without consent, payment cannot be completed. You may still browse the free content of this site.',
    backHome: 'Back to home',
  },
};

export const LEGAL = { 'zh-CN': zhCN, 'zh-TW': zhTW, en };
