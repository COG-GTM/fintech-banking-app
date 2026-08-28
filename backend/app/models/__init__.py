# ruff: noqa: I001
# Export all Pydantic models from core_models
from .core_models import (
    AccountCreate as AccountCreate,
    AccountResponse as AccountResponse,
    AccountSummary as AccountSummary,
    AccountUpdate as AccountUpdate,
    BankLinkRequest as BankLinkRequest,
    BankLinkResponse as BankLinkResponse,
    BaseResponse as BaseResponse,
    BillPaymentRequest as BillPaymentRequest,
    BlockUserRequest as BlockUserRequest,
    BudgetCreate as BudgetCreate,
    BudgetResponse as BudgetResponse,
    BudgetSummary as BudgetSummary,
    BudgetUpdate as BudgetUpdate,
    BulkMessageUpdate as BulkMessageUpdate,
    CategoryCreate as CategoryCreate,
    CategoryResponse as CategoryResponse,
    CategoryUpdate as CategoryUpdate,
    ChatSummary as ChatSummary,
    ContactCreate as ContactCreate,
    ContactResponse as ContactResponse,
    ContactStatusUpdate as ContactStatusUpdate,
    ContactUpdate as ContactUpdate,
    ConversationCreate as ConversationCreate,
    ConversationParticipantResponse as ConversationParticipantResponse,
    ConversationResponse as ConversationResponse,
    ConversationUpdate as ConversationUpdate,
    CurrencyConversion as CurrencyConversion,
    CurrencyConversionRequest as CurrencyConversionRequest,
    CurrencyConversionResponse as CurrencyConversionResponse,
    CurrencyInfoResponse as CurrencyInfoResponse,
    DepositRequest as DepositRequest,
    DeviceTrustUpdate as DeviceTrustUpdate,
    DirectMessageCreate as DirectMessageCreate,
    DirectMessageReply as DirectMessageReply,
    DirectMessageResponse as DirectMessageResponse,
    ExportRequest as ExportRequest,
    ExportResponse as ExportResponse,
    GoalContribute as GoalContribute,
    GoalCreate as GoalCreate,
    GoalResponse as GoalResponse,
    GoalSummary as GoalSummary,
    GoalUpdate as GoalUpdate,
    ImportFileRequest as ImportFileRequest,
    ImportFileResponse as ImportFileResponse,
    IncomeExpenseSummary as IncomeExpenseSummary,
    JointAccountCreate as JointAccountCreate,
    LinkedAccountResponse as LinkedAccountResponse,
    MessageCreate as MessageCreate,
    MessageFolderCreate as MessageFolderCreate,
    MessageFolderResponse as MessageFolderResponse,
    MessageMoveRequest as MessageMoveRequest,
    MessageReadReceiptResponse as MessageReadReceiptResponse,
    MessageResponse as MessageResponse,
    MessageSettingsUpdate as MessageSettingsUpdate,
    MessageSettingsResponse as MessageSettingsResponse,
    MessageUpdate as MessageUpdate,
    NotificationResponse as NotificationResponse,
    NotificationUpdate as NotificationUpdate,
    PaymentMethodBankCreate as PaymentMethodBankCreate,
    PaymentMethodBase as PaymentMethodBase,
    PaymentMethodCardCreate as PaymentMethodCardCreate,
    PaymentMethodResponse as PaymentMethodResponse,
    PaymentMethodUpdate as PaymentMethodUpdate,
    PaymentMethodWalletCreate as PaymentMethodWalletCreate,
    RecurringRuleCreate as RecurringRuleCreate,
    RecurringRuleResponse as RecurringRuleResponse,
    SecurityAuditLogResponse as SecurityAuditLogResponse,
    SpendingByCategory as SpendingByCategory,
    TransactionAttachment as TransactionAttachment,
    TransactionAttachmentCreate as TransactionAttachmentCreate,
    TransactionCreate as TransactionCreate,
    TransactionFilter as TransactionFilter,
    TransactionResponse as TransactionResponse,
    TransactionSplitCreate as TransactionSplitCreate,
    TransactionSplitResponse as TransactionSplitResponse,
    TransactionUpdate as TransactionUpdate,
    TransferCreate as TransferCreate,
    TransferRequest as TransferRequest,
    TransferResponse as TransferResponse,
    TwoFactorResponse as TwoFactorResponse,
    TwoFactorSetup as TwoFactorSetup,
    TwoFactorSetupResponse as TwoFactorSetupResponse,
    TwoFactorVerify as TwoFactorVerify,
    UserCreate as UserCreate,
    UserDeviceResponse as UserDeviceResponse,
    UserLogin as UserLogin,
    UserResponse as UserResponse,
    UserUpdate as UserUpdate,
    WithdrawalRequest as WithdrawalRequest,
)
from .mock_models import (
    Alert as Alert,
    AnalyticsEvent as AnalyticsEvent,
    BankLink as BankLink,
    Bill as Bill,
    Holding as Holding,
    InvestmentAccount as InvestmentAccount,
    P2PTransaction as P2PTransaction,
    PlaidAccount as PlaidAccount,
    SocialConnection as SocialConnection,
    TransactionsSyncStatus as TransactionsSyncStatus,
)
from .memory_models import (
    Account as Account,
    AccountType as AccountType,
    AssetBridge as AssetBridge,
    AssetClass as AssetClass,
    BlockchainNetwork as BlockchainNetwork,
    Budget as Budget,
    BudgetPeriod as BudgetPeriod,
    Card as Card,
    CardSpendingLimit as CardSpendingLimit,
    CardStatus as CardStatus,
    CardType as CardType,
    Category as Category,
    ChallengeParticipant as ChallengeParticipantMemory,
    CollateralPosition as CollateralPosition,
    Contact as Contact,
    ContactStatus as ContactStatus,
    Conversation as Conversation,
    ConversationParticipant as ConversationParticipant,
    ConversionRate as ConversionRate,
    ConversionType as ConversionType,
    CreditAlert as CreditAlert,
    CreditAlertSeverity as CreditAlertSeverity,
    CreditAlertType as CreditAlertType,
    CreditBuilderAccount as CreditBuilderAccount,
    CreditBuilderType as CreditBuilderType,
    CreditDispute as CreditDispute,
    CreditDisputeStatus as CreditDisputeStatus,
    CreditDisputeType as CreditDisputeType,
    CreditScore as CreditScore,
    CreditSimulation as CreditSimulation,
    CryptoAsset as CryptoAsset,
    CryptoAssetType as CryptoAssetType,
    CryptoTransaction as CryptoTransaction,
    CryptoTransactionStatus as CryptoTransactionStatus,
    CryptoWallet as CryptoWallet,
    DeFiPosition as DeFiPosition,
    DeFiProtocolType as DeFiProtocolType,
    DirectMessage as DirectMessage,
    ExpenseReport as ExpenseReportMemory,
    Goal as Goal,
    GoalContribution as GoalContribution,
    GoalStatus as GoalStatus,
    Invoice as InvoiceMemory,
    LinkedAccount as LinkedAccount,
    Log as Log,
    Merchant as Merchant,
    Message as Message,
    MessageReadReceipt as MessageReadReceipt,
    MessageStatus as MessageStatus,
    NFTAsset as NFTAsset,
    Note as Note,
    Notification as Notification,
    NotificationType as NotificationType,
    PaymentMethod as PaymentMethod,
    PaymentMethodStatus as PaymentMethodStatus,
    PaymentMethodType as PaymentMethodType,
    Receipt as ReceiptMemory,
    RecurringRule as RecurringRule,
    RoundUpConfig as RoundUpConfigMemory,
    RoundUpTransaction as RoundUpTransactionMemory,
    SavingsChallenge as SavingsChallengeMemory,
    SavingsRule as SavingsRuleMemory,
    SecurityAuditLog as SecurityAuditLog,
    SecurityEvent as SecurityEvent,
    SecurityEventType as SecurityEventType,
    Subscription as Subscription,
    SubscriptionCategory as SubscriptionCategory,
    SubscriptionStatus as SubscriptionStatus,
    TwoFactorAuth as TwoFactorAuth,
    TransactionDirection as TransactionDirection,
    TransactionStatus as TransactionStatus,
    TransactionType as TransactionType,
    Transaction as Transaction,
    UnifiedBalance as UnifiedBalance,
    UnifiedTransaction as UnifiedTransaction,
    UnifiedTransferStatus as UnifiedTransferStatus,
    User as User,
    UserDevice as UserDevice,
    UserRole as UserRole,
)
from .dto import (
    AccountType as AccountType,
    ApplicationStatus as ApplicationStatus,
    BankLinkStatus as BankLinkStatus,
    BillingCycle as BillingCycle,
    BudgetPeriod as BudgetPeriod,
    CardCategory as CardCategory,
    CardStatus as CardStatus,
    CardType as CardType,
    ChallengeStatus as ChallengeStatus,
    ChallengeType as ChallengeType,
    ContactStatus as ContactStatus,
    CreditFactorType as CreditFactorType,
    CreditScoreProvider as CreditScoreProvider,
    CreditScoreRange as CreditScoreRange,
    EmploymentType as EmploymentType,
    ExpenseReportStatus as ExpenseReportStatus,
    ExportFormat as ExportFormat,
    GoalStatus as GoalStatus,
    InvoiceStatus as InvoiceStatus,
    MessageStatus as MessageStatus,
    NotificationType as NotificationType,
    OfferStatus as OfferStatus,
    OptimizationSuggestionType as OptimizationSuggestionType,
    PaymentMethodStatus as PaymentMethodStatus,
    PaymentMethodType as PaymentMethodType,
    PaymentTerms as PaymentTerms,
    RoundUpStatus as RoundUpStatus,
    SavingsRuleFrequency as SavingsRuleFrequency,
    SavingsRuleType as SavingsRuleType,
    SecurityEventType as SecurityEventType,
    SpendingLimitPeriod as SpendingLimitPeriod,
    SubscriptionCategory as SubscriptionCategory,
    SubscriptionStatus as SubscriptionStatus,
    TaxCategory as TaxCategory,
    TradeStatus as TradeStatus,
    TransactionStatus as TransactionStatus,
    TransactionType as TransactionType,
    TwoFactorMethod as TwoFactorMethod,
    UserRole as UserRole,
)
from .entities import (
    business_models as business_models,
    card_models as card_models,
    credit_models as credit_models,
    savings_models as savings_models,
    subscription_models as subscription_models,
)

# Business Models
from .entities.business_models import (
    APIKeyRequest as APIKeyRequest,
    APIKeyResponse as APIKeyResponse,
    AuthorizedUserRequest as AuthorizedUserRequest,
    AuthorizedUserResponse as AuthorizedUserResponse,
    BusinessAccountCreateRequest as BusinessAccountCreateRequest,
    BusinessAccountResponse as BusinessAccountResponse,
    BusinessExpenseRequest as BusinessExpenseRequest,
    BusinessExpenseResponse as BusinessExpenseResponse,
    BusinessLoanApplicationRequest as BusinessLoanApplicationRequest,
    BusinessLoanResponse as BusinessLoanResponse,
    CashFlowAnalysisResponse as CashFlowAnalysisResponse,
    CreditLineApplicationRequest as CreditLineApplicationRequest,
    CreditLineResponse as CreditLineResponse,
    ExpenseReportRequest as ExpenseReportRequest,
    ExpenseReportResponse as ExpenseReportResponse,
    InvoiceCreateRequest as InvoiceCreateRequest,
    InvoiceLineItem as InvoiceLineItem,
    InvoiceResponse as InvoiceResponse,
    PayrollEmployee as PayrollEmployee,
    PayrollRequest as PayrollRequest,
    PayrollResponse as PayrollResponse,
    ReceiptResponse as ReceiptResponse,
    ReceiptUploadRequest as ReceiptUploadRequest,
    RecurringPaymentRequest as RecurringPaymentRequest,
    RecurringPaymentResponse as RecurringPaymentResponse,
    TaxEstimateResponse as TaxEstimateResponse,
    TaxReportResponse as TaxReportResponse,
    TransactionCategorizationRequest as TransactionCategorizationRequest,
    TransactionCategorizationResponse as TransactionCategorizationResponse,
    VendorCreateRequest as VendorCreateRequest,
    VendorResponse as VendorResponse,
)

# Card Models
from .entities.card_models import (
    CardAnalyticsResponse as CardAnalyticsResponse,
    CardFreezeRequest as CardFreezeRequest,
    CardLimitRequest as CardLimitRequest,
    CardLimitResponse as CardLimitResponse,
    VirtualCardCreate as VirtualCardCreate,
    VirtualCardResponse as VirtualCardResponse,
)

# Credit Models
from .entities.credit_models import (
    CreditHistoryResponse as CreditHistoryResponse,
    CreditReportResponse as CreditReportResponse,
    CreditScoreResponse as CreditScoreResponse,
    CreditSimulatorRequest as CreditSimulatorRequest,
    CreditSimulatorResponse as CreditSimulatorResponse,
    CreditTip as CreditTip,
    CreditTipsResponse as CreditTipsResponse,
)

# Crypto Models
from .entities.crypto_models import (
    BlockchainNetwork as BlockchainNetwork,
    CryptoAssetResponse as CryptoAssetResponse,
    CryptoAssetType as CryptoAssetType,
    CryptoPortfolioSummary as CryptoPortfolioSummary,
    CryptoSwapQuote as CryptoSwapQuote,
    CryptoSwapRequest as CryptoSwapRequest,
    CryptoTransactionCreate as CryptoTransactionCreate,
    CryptoTransactionResponse as CryptoTransactionResponse,
    CryptoWalletCreate as CryptoWalletCreate,
    CryptoWalletResponse as CryptoWalletResponse,
    DeFiPositionResponse as DeFiPositionResponse,
    DeFiProtocolType as DeFiProtocolType,
    NFTAssetResponse as NFTAssetResponse,
    TransactionDirection as TransactionDirection,
)

# Currency Converter Models
from .entities.currency_converter_models import (
    ComplianceCheckResponse as ComplianceCheckResponse,
    ConversionHistoryResponse as ConversionHistoryResponse,
    ConversionOrderCreate as ConversionOrderCreate,
    ConversionOrderResponse as ConversionOrderResponse,
    ConversionQuoteRequest as ConversionQuoteRequest,
    ConversionQuoteResponse as ConversionQuoteResponse,
    CurrencyBalanceResponse as CurrencyBalanceResponse,
    CurrencyPair as CurrencyPair,
    CurrencySupportedResponse as CurrencySupportedResponse,
    CurrencyType as CurrencyType,
    ExchangeRateResponse as ExchangeRateResponse,
    FeeType as FeeType,
    P2PTradeRequest as P2PTradeRequest,
    P2PTradeResponse as P2PTradeResponse,
    PeerOfferCreate as PeerOfferCreate,
    PeerOfferResponse as PeerOfferResponse,
    PeerStatus as PeerStatus,
    TransferLimitResponse as TransferLimitResponse,
    TransferMethod as TransferMethod,
    TransferStatus as TransferStatus,
    VerificationLevel as VerificationLevel,
)

# Insurance Models
from .entities.insurance_models import (
    AutoInsuranceDetails as AutoInsuranceDetails,
    ClaimStatus as ClaimStatus,
    ClaimTimelineEvent as ClaimTimelineEvent,
    CoverageType as CoverageType,
    HealthInsuranceDetails as HealthInsuranceDetails,
    InsuranceClaimCreate as InsuranceClaimCreate,
    InsuranceClaimResponse as InsuranceClaimResponse,
    InsurancePolicyCreate as InsurancePolicyCreate,
    InsurancePolicyResponse as InsurancePolicyResponse,
    InsuranceProviderResponse as InsuranceProviderResponse,
    InsuranceQuoteRequest as InsuranceQuoteRequest,
    InsuranceQuoteResponse as InsuranceQuoteResponse,
    InsuranceSummaryResponse as InsuranceSummaryResponse,
    InsuranceType as InsuranceType,
    PolicyStatus as PolicyStatus,
    PremiumFrequency as PremiumFrequency,
)

# Investment Models
from .entities.investment_models import (
    AssetResponse as AssetResponse,
    AssetType as AssetType,
    ETFDetailResponse as ETFDetailResponse,
    InvestmentAccountCreate as InvestmentAccountCreate,
    InvestmentAccountResponse as InvestmentAccountResponse,
    InvestmentAccountType as InvestmentAccountType,
    InvestmentSummaryResponse as InvestmentSummaryResponse,
    MarketDataResponse as MarketDataResponse,
    OrderSide as OrderSide,
    OrderStatus as OrderStatus,
    OrderType as OrderType,
    PortfolioAnalysisResponse as PortfolioAnalysisResponse,
    PortfolioResponse as PortfolioResponse,
    PortfolioRiskLevel as PortfolioRiskLevel,
    PositionResponse as PositionResponse,
    ResearchReportResponse as ResearchReportResponse,
    StockDetailResponse as StockDetailResponse,
    TaxDocumentResponse as TaxDocumentResponse,
    TradeHistoryResponse as TradeHistoryResponse,
    TradeOrderCreate as TradeOrderCreate,
    TradeOrderResponse as TradeOrderResponse,
    TradingSession as TradingSession,
    WatchlistCreate as WatchlistCreate,
    WatchlistResponse as WatchlistResponse,
)

# Loan Models
from .entities.loan_models import (
    CryptoLoanCreate as CryptoLoanCreate,
    InterestType as InterestType,
    LoanAmortizationRequest as LoanAmortizationRequest,
    LoanApplicationCreate as LoanApplicationCreate,
    LoanApplicationResponse as LoanApplicationResponse,
    LoanOfferResponse as LoanOfferResponse,
    LoanPaymentCreate as LoanPaymentCreate,
    LoanPaymentResponse as LoanPaymentResponse,
    LoanPaymentScheduleResponse as LoanPaymentScheduleResponse,
    LoanRefinanceAnalysis as LoanRefinanceAnalysis,
    LoanResponse as LoanResponse,
    LoanStatus as LoanStatus,
    LoanSummaryStats as LoanSummaryStats,
    LoanType as LoanType,
    PaymentFrequency as PaymentFrequency,
)

# Savings Models
from .entities.savings_models import (
    ChallengeJoinRequest as ChallengeJoinRequest,
    RoundUpConfigRequest as RoundUpConfigRequest,
    RoundUpConfigResponse as RoundUpConfigResponse,
    RoundUpTransaction as RoundUpTransaction,
    RoundUpTransactionResponse as RoundUpTransactionResponse,
    SavingsChallengeResponse as SavingsChallengeResponse,
    SavingsGoalCreate as SavingsGoalCreate,
    SavingsRuleRequest as SavingsRuleRequest,
    SavingsRuleResponse as SavingsRuleResponse,
)

# Safe to Spend Models
from .entities.safe_to_spend_models import (
    SafeToSpendResponse as SafeToSpendResponse,
    UpcomingBill as UpcomingBill,
)

# Subscription Models
from .entities.subscription_models import (
    BulkImportRequest as BulkImportRequest,
    BulkImportResponse as BulkImportResponse,
    CancellationReminderRequest as CancellationReminderRequest,
    CancellationReminderResponse as CancellationReminderResponse,
    OptimizationResponse as OptimizationResponse,
    OptimizationSuggestion as OptimizationSuggestion,
    PaymentHistoryResponse as PaymentHistoryResponse,
    SubscriptionAnalysisResponse as SubscriptionAnalysisResponse,
    SubscriptionCancelRequest as SubscriptionCancelRequest,
    SubscriptionCancelResponse as SubscriptionCancelResponse,
    SubscriptionCreateRequest as SubscriptionCreateRequest,
    SubscriptionDetailResponse as SubscriptionDetailResponse,
    SubscriptionPauseRequest as SubscriptionPauseRequest,
    SubscriptionPauseResponse as SubscriptionPauseResponse,
    SubscriptionRecommendationsResponse as SubscriptionRecommendationsResponse,
    SubscriptionReminderRequest as SubscriptionReminderRequest,
    SubscriptionReminderResponse as SubscriptionReminderResponse,
    SubscriptionResponse as SubscriptionResponse,
    SubscriptionShareRequest as SubscriptionShareRequest,
    SubscriptionShareResponse as SubscriptionShareResponse,
    SubscriptionSummaryResponse as SubscriptionSummaryResponse,
    SubscriptionUpdateRequest as SubscriptionUpdateRequest,
    SubscriptionUsageRequest as SubscriptionUsageRequest,
    SubscriptionUsageResponse as SubscriptionUsageResponse,
)

# Unified Models
from .entities.unified_models import (
    AssetBridgeRequest as AssetBridgeRequest,
    AssetBridgeResponse as AssetBridgeResponse,
    AssetClass as AssetClass,
    CollateralPositionResponse as CollateralPositionResponse,
    ConversionType as ConversionType,
    CrossAssetOpportunity as CrossAssetOpportunity,
    PortfolioOptimizationRequest as PortfolioOptimizationRequest,
    PortfolioOptimizationResponse as PortfolioOptimizationResponse,
    TransferStatus as TransferStatus,
    UnifiedBalanceResponse as UnifiedBalanceResponse,
    UnifiedSearchRequest as UnifiedSearchRequest,
    UnifiedSearchResponse as UnifiedSearchResponse,
    UnifiedTransferRequest as UnifiedTransferRequest,
    UnifiedTransferResponse as UnifiedTransferResponse,
)

# Create backwards compatibility aliases (after all imports)
CurrencyInfo = CurrencyInfoResponse
# Use memory models for database operations
ExpenseReport = ExpenseReportMemory
Invoice = InvoiceMemory
Receipt = ReceiptMemory

# Add missing model aliases for route imports
SpendingLimit = CardLimitResponse
MessageSettings = MessageSettingsResponse
MessageFolder = MessageFolderResponse
RoundUpConfig = RoundUpConfigMemory
SavingsChallenge = SavingsChallengeMemory
SavingsRule = SavingsRuleMemory
CancellationReminder = CancellationReminderResponse
RoundUpTransaction = RoundUpTransactionMemory

# Create placeholder classes for missing database models
# These models are used in routes but don't exist in memory_models yet
from pydantic import BaseModel as _BaseModel, ConfigDict as _ConfigDict  # noqa: E402

class MessageAttachment(_BaseModel):
    """Placeholder for MessageAttachment model"""
    model_config = _ConfigDict(from_attributes=True)

    message_id: int
    filename: str
    file_url: str
    file_size: int | None = None
    content_type: str | None = None

class BlockedUser(_BaseModel):
    """Placeholder for BlockedUser model"""
    model_config = _ConfigDict(from_attributes=True)

    user_id: int
    blocked_user_id: int
    reason: str | None = None
    blocked_at: str | None = None

ChallengeParticipant = ChallengeParticipantMemory

__all__ = [name for name in dir() if not name.startswith('_')]
