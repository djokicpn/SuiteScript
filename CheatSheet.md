### 1. User Event Type
```
const type = context.type;
if(type === context.UserEventType.CREATE) {
    // Do Something
}
```

```
context = {object}  
    UserEventType = {object}  
        COPY = {string} copy
        CREATE = {string} create
        VIEW = {string} view
        EDIT = {string} edit
        XEDIT = {string} xedit
        DELETE = {string} delete
        DROPSHIP = {string} dropship
        SPECIALORDER = {string} specialorder
        ORDERITEMS = {string} orderitems
        CANCEL = {string} cancel
        APPROVE = {string} approve
        REJECT = {string} reject
        PACK = {string} pack
        SHIP = {string} ship
        EDITFORECAST = {string} editforecast
        REASSIGN = {string} reassign
        MARKCOMPLETE = {string} markcomplete
        PRINT = {string} print
        EMAIL = {string} email
        CHANGEPASSWORD = {string} changepassword
        TRANSFORM = {string} transform
        PAYBILLS = {string} paybills
        QUICKVIEW = {string} quickview
```

```
Type = {object}  
    ACCOUNT = {string} account
    ACCOUNTING_BOOK = {string} accountingbook
    ACCOUNTING_CONTEXT = {string} accountingcontext
    ACCOUNTING_PERIOD = {string} accountingperiod
    ADV_INTER_COMPANY_JOURNAL_ENTRY = {string} advintercompanyjournalentry
    ALLOCATION_SCHEDULE = {string} allocationschedule
    AMORTIZATION_SCHEDULE = {string} amortizationschedule
    AMORTIZATION_TEMPLATE = {string} amortizationtemplate
    ASSEMBLY_BUILD = {string} assemblybuild
    ASSEMBLY_ITEM = {string} assemblyitem
    ASSEMBLY_UNBUILD = {string} assemblyunbuild
    BILLING_ACCOUNT = {string} billingaccount
    BILLING_CLASS = {string} billingclass
    BILLING_RATE_CARD = {string} billingratecard
    BILLING_REVENUE_EVENT = {string} billingrevenueevent
    BILLING_SCHEDULE = {string} billingschedule
    BIN = {string} bin
    BIN_TRANSFER = {string} bintransfer
    BIN_WORKSHEET = {string} binworksheet
    BLANKET_PURCHASE_ORDER = {string} blanketpurchaseorder
    BOM = {string} bom
    BOM_REVISION = {string} bomrevision
    BUDGET_EXCHANGE_RATE = {string} budgetexchangerate
    BULK_OWNERSHIP_TRANSFER = {string} bulkownershiptransfer
    BUNDLE_INSTALLATION_SCRIPT = {string} bundleinstallationscript
    CALENDAR_EVENT = {string} calendarevent
    CAMPAIGN = {string} campaign
    CAMPAIGN_RESPONSE = {string} campaignresponse
    CAMPAIGN_TEMPLATE = {string} campaigntemplate
    CASH_REFUND = {string} cashrefund
    CASH_SALE = {string} cashsale
    CHARGE = {string} charge
    CHARGE_RULE = {string} chargerule
    CHECK = {string} check
    CLASSIFICATION = {string} classification
    CLIENT_SCRIPT = {string} clientscript
    CMS_CONTENT = {string} cmscontent
    CMS_CONTENT_TYPE = {string} cmscontenttype
    CMS_PAGE = {string} cmspage
    COMMERCE_CATEGORY = {string} commercecategory
    COMPETITOR = {string} competitor
    CONSOLIDATED_EXCHANGE_RATE = {string} consolidatedexchangerate
    CONTACT = {string} contact
    CONTACT_CATEGORY = {string} contactcategory
    CONTACT_ROLE = {string} contactrole
    COST_CATEGORY = {string} costcategory
    COUPON_CODE = {string} couponcode
    CREDIT_CARD_CHARGE = {string} creditcardcharge
    CREDIT_CARD_REFUND = {string} creditcardrefund
    CREDIT_MEMO = {string} creditmemo
    CURRENCY = {string} currency
    CUSTOMER = {string} customer
    CUSTOMER_CATEGORY = {string} customercategory
    CUSTOMER_DEPOSIT = {string} customerdeposit
    CUSTOMER_MESSAGE = {string} customermessage
    CUSTOMER_PAYMENT = {string} customerpayment
    CUSTOMER_PAYMENT_AUTHORIZATION = {string} customerpaymentauthorization
    CUSTOMER_REFUND = {string} customerrefund
    CUSTOMER_STATUS = {string} customerstatus
    CUSTOMER_SUBSIDIARY_RELATIONSHIP = {string} customersubsidiaryrelationship
    CUSTOM_RECORD = {string} customrecord
    CUSTOM_TRANSACTION = {string} customtransaction
    DEPARTMENT = {string} department
    DEPOSIT = {string} deposit
    DEPOSIT_APPLICATION = {string} depositapplication
    DESCRIPTION_ITEM = {string} descriptionitem
    DISCOUNT_ITEM = {string} discountitem
    DOWNLOAD_ITEM = {string} downloaditem
    EMAIL_TEMPLATE = {string} emailtemplate
    EMPLOYEE = {string} employee
    EMPLOYEE_CHANGE_REQUEST = {string} employeechangerequest
    EMPLOYEE_CHANGE_TYPE = {string} employeechangetype
    ENTITY_ACCOUNT_MAPPING = {string} entityaccountmapping
    ESTIMATE = {string} estimate
    EXPENSE_AMORTIZATION_EVENT = {string} expenseamortizationevent
    EXPENSE_CATEGORY = {string} expensecategory
    EXPENSE_PLAN = {string} expenseplan
    EXPENSE_REPORT = {string} expensereport
    FAIR_VALUE_PRICE = {string} fairvalueprice
    FIXED_AMOUNT_PROJECT_REVENUE_RULE = {string} fixedamountprojectrevenuerule
    FOLDER = {string} folder
    FULFILLMENT_REQUEST = {string} fulfillmentrequest
    GENERAL_TOKEN = {string} generaltoken
    GENERIC_RESOURCE = {string} genericresource
    GIFT_CERTIFICATE = {string} giftcertificate
    GIFT_CERTIFICATE_ITEM = {string} giftcertificateitem
    GL_NUMBERING_SEQUENCE = {string} glnumberingsequence
    GLOBAL_ACCOUNT_MAPPING = {string} globalaccountmapping
    GLOBAL_INVENTORY_RELATIONSHIP = {string} globalinventoryrelationship
    GOAL = {string} goal
    INBOUND_SHIPMENT = {string} inboundshipment
    INTERCOMP_ALLOCATION_SCHEDULE = {string} intercompallocationschedule
    INTER_COMPANY_JOURNAL_ENTRY = {string} intercompanyjournalentry
    INTER_COMPANY_TRANSFER_ORDER = {string} intercompanytransferorder
    INVENTORY_ADJUSTMENT = {string} inventoryadjustment
    INVENTORY_COST_REVALUATION = {string} inventorycostrevaluation
    INVENTORY_COUNT = {string} inventorycount
    INVENTORY_DETAIL = {string} inventorydetail
    INVENTORY_ITEM = {string} inventoryitem
    INVENTORY_NUMBER = {string} inventorynumber
    INVENTORY_STATUS = {string} inventorystatus
    INVENTORY_STATUS_CHANGE = {string} inventorystatuschange
    INVENTORY_TRANSFER = {string} inventorytransfer
    INVOICE = {string} invoice
    ISSUE = {string} issue
    ISSUE_PRODUCT = {string} issueproduct
    ISSUE_PRODUCT_VERSION = {string} issueproductversion
    ITEM_ACCOUNT_MAPPING = {string} itemaccountmapping
    ITEM_DEMAND_PLAN = {string} itemdemandplan
    ITEM_FULFILLMENT = {string} itemfulfillment
    ITEM_GROUP = {string} itemgroup
    ITEM_LOCATION_CONFIGURATION = {string} itemlocationconfiguration
    ITEM_RECEIPT = {string} itemreceipt
    ITEM_REVISION = {string} itemrevision
    ITEM_SUPPLY_PLAN = {string} itemsupplyplan
    JOB = {string} job
    JOB_STATUS = {string} jobstatus
    JOB_TYPE = {string} jobtype
    JOURNAL_ENTRY = {string} journalentry
    KIT_ITEM = {string} kititem
    LABOR_BASED_PROJECT_REVENUE_RULE = {string} laborbasedprojectrevenuerule
    LEAD = {string} lead
    LOCATION = {string} location
    LOT_NUMBERED_ASSEMBLY_ITEM = {string} lotnumberedassemblyitem
    LOT_NUMBERED_INVENTORY_ITEM = {string} lotnumberedinventoryitem
    MANUFACTURING_COST_TEMPLATE = {string} manufacturingcosttemplate
    MANUFACTURING_OPERATION_TASK = {string} manufacturingoperationtask
    MANUFACTURING_ROUTING = {string} manufacturingrouting
    MAP_REDUCE_SCRIPT = {string} mapreducescript
    MARKUP_ITEM = {string} markupitem
    MASSUPDATE_SCRIPT = {string} massupdatescript
    MERCHANDISE_HIERARCHY_LEVEL = {string} merchandisehierarchylevel
    MERCHANDISE_HIERARCHY_NODE = {string} merchandisehierarchynode
    MERCHANDISE_HIERARCHY_VERSION = {string} merchandisehierarchyversion
    MESSAGE = {string} message
    MFG_PLANNED_TIME = {string} mfgplannedtime
    NEXUS = {string} nexus
    NON_INVENTORY_ITEM = {string} noninventoryitem
    NOTE = {string} note
    NOTE_TYPE = {string} notetype
    OPPORTUNITY = {string} opportunity
    ORDER_SCHEDULE = {string} orderschedule
    OTHER_CHARGE_ITEM = {string} otherchargeitem
    OTHER_NAME = {string} othername
    OTHER_NAME_CATEGORY = {string} othernamecategory
    PARTNER = {string} partner
    PARTNER_CATEGORY = {string} partnercategory
    PAYCHECK = {string} paycheck
    PAYCHECK_JOURNAL = {string} paycheckjournal
    PAYMENT_CARD = {string} paymentcard
    PAYMENT_CARD_TOKEN = {string} paymentcardtoken
    PAYMENT_ITEM = {string} paymentitem
    PAYMENT_METHOD = {string} paymentmethod
    PAYROLL_ITEM = {string} payrollitem
    PCT_COMPLETE_PROJECT_REVENUE_RULE = {string} pctcompleteprojectrevenuerule
    PERFORMANCE_REVIEW = {string} performancereview
    PERFORMANCE_REVIEW_SCHEDULE = {string} performancereviewschedule
    PERIOD_END_JOURNAL = {string} periodendjournal
    PHONE_CALL = {string} phonecall
    PORTLET = {string} portlet
    PRICE_BOOK = {string} pricebook
    PRICE_LEVEL = {string} pricelevel
    PRICE_PLAN = {string} priceplan
    PRICING_GROUP = {string} pricinggroup
    PROJECT_EXPENSE_TYPE = {string} projectexpensetype
    PROJECT_TASK = {string} projecttask
    PROJECT_TEMPLATE = {string} projecttemplate
    PROMOTION_CODE = {string} promotioncode
    PROSPECT = {string} prospect
    PURCHASE_CONTRACT = {string} purchasecontract
    PURCHASE_ORDER = {string} purchaseorder
    PURCHASE_REQUISITION = {string} purchaserequisition
    REALLOCATE_ITEM = {string} reallocateitem
    RECEIVE_INBOUND_SHIPMENT = {string} receiveinboundshipment
    RESOURCE_ALLOCATION = {string} resourceallocation
    RESTLET = {string} restlet
    RETURN_AUTHORIZATION = {string} returnauthorization
    REVENUE_ARRANGEMENT = {string} revenuearrangement
    REVENUE_COMMITMENT = {string} revenuecommitment
    REVENUE_COMMITMENT_REVERSAL = {string} revenuecommitmentreversal
    REVENUE_PLAN = {string} revenueplan
    REV_REC_SCHEDULE = {string} revrecschedule
    REV_REC_TEMPLATE = {string} revrectemplate
    SALES_ORDER = {string} salesorder
    SALES_ROLE = {string} salesrole
    SALES_TAX_ITEM = {string} salestaxitem
    SCHEDULED_SCRIPT = {string} scheduledscript
    SCHEDULED_SCRIPT_INSTANCE = {string} scheduledscriptinstance
    SCRIPT_DEPLOYMENT = {string} scriptdeployment
    SERIALIZED_ASSEMBLY_ITEM = {string} serializedassemblyitem
    SERIALIZED_INVENTORY_ITEM = {string} serializedinventoryitem
    SERVICE_ITEM = {string} serviceitem
    SHIP_ITEM = {string} shipitem
    SOLUTION = {string} solution
    STATISTICAL_JOURNAL_ENTRY = {string} statisticaljournalentry
    STORE_PICKUP_FULFILLMENT = {string} storepickupfulfillment
    SUBSCRIPTION = {string} subscription
    SUBSCRIPTION_CHANGE_ORDER = {string} subscriptionchangeorder
    SUBSCRIPTION_LINE = {string} subscriptionline
    SUBSCRIPTION_PLAN = {string} subscriptionplan
    SUBSIDIARY = {string} subsidiary
    SUBTOTAL_ITEM = {string} subtotalitem
    SUITELET = {string} suitelet
    SUPPLY_CHAIN_SNAPSHOT = {string} supplychainsnapshot
    SUPPORT_CASE = {string} supportcase
    TASK = {string} task
    TAX_ACCT = {string} taxacct
    TAX_GROUP = {string} taxgroup
    TAX_PERIOD = {string} taxperiod
    TAX_TYPE = {string} taxtype
    TERM = {string} term
    TIME_BILL = {string} timebill
    TIME_ENTRY = {string} timeentry
    TIME_OFF_CHANGE = {string} timeoffchange
    TIME_OFF_PLAN = {string} timeoffplan
    TIME_OFF_REQUEST = {string} timeoffrequest
    TIME_OFF_RULE = {string} timeoffrule
    TIME_OFF_TYPE = {string} timeofftype
    TIME_SHEET = {string} timesheet
    TOPIC = {string} topic
    TRANSFER_ORDER = {string} transferorder
    UNITS_TYPE = {string} unitstype
    USAGE = {string} usage
    USEREVENT_SCRIPT = {string} usereventscript
    VENDOR = {string} vendor
    VENDOR_BILL = {string} vendorbill
    VENDOR_CATEGORY = {string} vendorcategory
    VENDOR_CREDIT = {string} vendorcredit
    VENDOR_PAYMENT = {string} vendorpayment
    VENDOR_RETURN_AUTHORIZATION = {string} vendorreturnauthorization
    VENDOR_SUBSIDIARY_RELATIONSHIP = {string} vendorsubsidiaryrelationship
    WEBSITE = {string} website
    WORKFLOW_ACTION_SCRIPT = {string} workflowactionscript
    WORK_ORDER = {string} workorder
    WORK_ORDER_CLOSE = {string} workorderclose
    WORK_ORDER_COMPLETION = {string} workordercompletion
    WORK_ORDER_ISSUE = {string} workorderissue
    WORKPLACE = {string} workplace
```

N/search Types
```
Type = {object}  
    ACCOUNT = {string} account
    ACCOUNTING_BOOK = {string} accountingbook
    ACCOUNTING_CONTEXT = {string} accountingcontext
    ACCOUNTING_PERIOD = {string} accountingperiod
    ADV_INTER_COMPANY_JOURNAL_ENTRY = {string} advintercompanyjournalentry
    AMORTIZATION_SCHEDULE = {string} amortizationschedule
    AMORTIZATION_TEMPLATE = {string} amortizationtemplate
    ASSEMBLY_BUILD = {string} assemblybuild
    ASSEMBLY_ITEM = {string} assemblyitem
    ASSEMBLY_UNBUILD = {string} assemblyunbuild
    BILLING_ACCOUNT = {string} billingaccount
    BILLING_CLASS = {string} billingclass
    BILLING_RATE_CARD = {string} billingratecard
    BILLING_REVENUE_EVENT = {string} billingrevenueevent
    BILLING_SCHEDULE = {string} billingschedule
    BIN = {string} bin
    BIN_TRANSFER = {string} bintransfer
    BIN_WORKSHEET = {string} binworksheet
    BLANKET_PURCHASE_ORDER = {string} blanketpurchaseorder
    BOM = {string} bom
    BOM_REVISION = {string} bomrevision
    BUDGET_EXCHANGE_RATE = {string} budgetexchangerate
    BUNDLE_INSTALLATION_SCRIPT = {string} bundleinstallationscript
    CALENDAR_EVENT = {string} calendarevent
    CAMPAIGN = {string} campaign
    CASH_REFUND = {string} cashrefund
    CASH_SALE = {string} cashsale
    CHARGE = {string} charge
    CHARGE_RULE = {string} chargerule
    CHECK = {string} check
    CLASSIFICATION = {string} classification
    CLIENT_SCRIPT = {string} clientscript
    CMS_CONTENT = {string} cmscontent
    CMS_CONTENT_TYPE = {string} cmscontenttype
    CMS_PAGE = {string} cmspage
    COMMERCE_CATEGORY = {string} commercecategory
    COMPETITOR = {string} competitor
    CONSOLIDATED_EXCHANGE_RATE = {string} consolidatedexchangerate
    CONTACT = {string} contact
    CONTACT_CATEGORY = {string} contactcategory
    CONTACT_ROLE = {string} contactrole
    COST_CATEGORY = {string} costcategory
    COUPON_CODE = {string} couponcode
    CREDIT_CARD_CHARGE = {string} creditcardcharge
    CREDIT_CARD_REFUND = {string} creditcardrefund
    CREDIT_MEMO = {string} creditmemo
    CURRENCY = {string} currency
    CUSTOMER = {string} customer
    CUSTOMER_CATEGORY = {string} customercategory
    CUSTOMER_DEPOSIT = {string} customerdeposit
    CUSTOMER_MESSAGE = {string} customermessage
    CUSTOMER_PAYMENT = {string} customerpayment
    CUSTOMER_PAYMENT_AUTHORIZATION = {string} customerpaymentauthorization
    CUSTOMER_REFUND = {string} customerrefund
    CUSTOMER_STATUS = {string} customerstatus
    CUSTOMER_SUBSIDIARY_RELATIONSHIP = {string} customersubsidiaryrelationship
    CUSTOM_RECORD = {string} customrecord
    CUSTOM_TRANSACTION = {string} customtransaction
    DEPARTMENT = {string} department
    DEPOSIT = {string} deposit
    DEPOSIT_APPLICATION = {string} depositapplication
    DESCRIPTION_ITEM = {string} descriptionitem
    DISCOUNT_ITEM = {string} discountitem
    DOWNLOAD_ITEM = {string} downloaditem
    EMPLOYEE = {string} employee
    EMPLOYEE_CHANGE_REQUEST = {string} employeechangerequest
    EMPLOYEE_CHANGE_TYPE = {string} employeechangetype
    ENTITY_ACCOUNT_MAPPING = {string} entityaccountmapping
    ESTIMATE = {string} estimate
    EXPENSE_AMORTIZATION_EVENT = {string} expenseamortizationevent
    EXPENSE_CATEGORY = {string} expensecategory
    EXPENSE_PLAN = {string} expenseplan
    EXPENSE_REPORT = {string} expensereport
    FAIR_VALUE_PRICE = {string} fairvalueprice
    FIXED_AMOUNT_PROJECT_REVENUE_RULE = {string} fixedamountprojectrevenuerule
    FOLDER = {string} folder
    FULFILLMENT_REQUEST = {string} fulfillmentrequest
    GENERIC_RESOURCE = {string} genericresource
    GIFT_CERTIFICATE = {string} giftcertificate
    GIFT_CERTIFICATE_ITEM = {string} giftcertificateitem
    GL_NUMBERING_SEQUENCE = {string} glnumberingsequence
    GLOBAL_ACCOUNT_MAPPING = {string} globalaccountmapping
    GLOBAL_INVENTORY_RELATIONSHIP = {string} globalinventoryrelationship
    GOAL = {string} goal
    INBOUND_SHIPMENT = {string} inboundshipment
    INTER_COMPANY_JOURNAL_ENTRY = {string} intercompanyjournalentry
    INTER_COMPANY_TRANSFER_ORDER = {string} intercompanytransferorder
    INVENTORY_ADJUSTMENT = {string} inventoryadjustment
    INVENTORY_COST_REVALUATION = {string} inventorycostrevaluation
    INVENTORY_COUNT = {string} inventorycount
    INVENTORY_DETAIL = {string} inventorydetail
    INVENTORY_ITEM = {string} inventoryitem
    INVENTORY_NUMBER = {string} inventorynumber
    INVENTORY_STATUS = {string} inventorystatus
    INVENTORY_STATUS_CHANGE = {string} inventorystatuschange
    INVENTORY_TRANSFER = {string} inventorytransfer
    INVOICE = {string} invoice
    ISSUE = {string} issue
    ITEM_ACCOUNT_MAPPING = {string} itemaccountmapping
    ITEM_DEMAND_PLAN = {string} itemdemandplan
    ITEM_FULFILLMENT = {string} itemfulfillment
    ITEM_GROUP = {string} itemgroup
    ITEM_LOCATION_CONFIGURATION = {string} itemlocationconfiguration
    ITEM_RECEIPT = {string} itemreceipt
    ITEM_REVISION = {string} itemrevision
    ITEM_SUPPLY_PLAN = {string} itemsupplyplan
    JOB = {string} job
    JOB_STATUS = {string} jobstatus
    JOB_TYPE = {string} jobtype
    JOURNAL_ENTRY = {string} journalentry
    KIT_ITEM = {string} kititem
    LABOR_BASED_PROJECT_REVENUE_RULE = {string} laborbasedprojectrevenuerule
    LEAD = {string} lead
    LOCATION = {string} location
    LOT_NUMBERED_ASSEMBLY_ITEM = {string} lotnumberedassemblyitem
    LOT_NUMBERED_INVENTORY_ITEM = {string} lotnumberedinventoryitem
    MANUFACTURING_COST_TEMPLATE = {string} manufacturingcosttemplate
    MANUFACTURING_OPERATION_TASK = {string} manufacturingoperationtask
    MANUFACTURING_ROUTING = {string} manufacturingrouting
    MAP_REDUCE_SCRIPT = {string} mapreducescript
    MARKUP_ITEM = {string} markupitem
    MASSUPDATE_SCRIPT = {string} massupdatescript
    MERCHANDISE_HIERARCHY_LEVEL = {string} merchandisehierarchylevel
    MERCHANDISE_HIERARCHY_NODE = {string} merchandisehierarchynode
    MERCHANDISE_HIERARCHY_VERSION = {string} merchandisehierarchyversion
    MESSAGE = {string} message
    MFG_PLANNED_TIME = {string} mfgplannedtime
    NEXUS = {string} nexus
    NON_INVENTORY_ITEM = {string} noninventoryitem
    NOTE = {string} note
    NOTE_TYPE = {string} notetype
    OPPORTUNITY = {string} opportunity
    OTHER_CHARGE_ITEM = {string} otherchargeitem
    OTHER_NAME = {string} othername
    OTHER_NAME_CATEGORY = {string} othernamecategory
    PARTNER = {string} partner
    PARTNER_CATEGORY = {string} partnercategory
    PAYCHECK = {string} paycheck
    PAYCHECK_JOURNAL = {string} paycheckjournal
    PAYMENT_ITEM = {string} paymentitem
    PAYMENT_METHOD = {string} paymentmethod
    PAYROLL_ITEM = {string} payrollitem
    PCT_COMPLETE_PROJECT_REVENUE_RULE = {string} pctcompleteprojectrevenuerule
    PERFORMANCE_REVIEW = {string} performancereview
    PERFORMANCE_REVIEW_SCHEDULE = {string} performancereviewschedule
    PERIOD_END_JOURNAL = {string} periodendjournal
    PHONE_CALL = {string} phonecall
    PORTLET = {string} portlet
    PRICE_BOOK = {string} pricebook
    PRICE_LEVEL = {string} pricelevel
    PRICE_PLAN = {string} priceplan
    PRICING_GROUP = {string} pricinggroup
    PROJECT_EXPENSE_TYPE = {string} projectexpensetype
    PROJECT_TASK = {string} projecttask
    PROJECT_TEMPLATE = {string} projecttemplate
    PROMOTION_CODE = {string} promotioncode
    PROSPECT = {string} prospect
    PURCHASE_CONTRACT = {string} purchasecontract
    PURCHASE_ORDER = {string} purchaseorder
    PURCHASE_REQUISITION = {string} purchaserequisition
    RESOURCE_ALLOCATION = {string} resourceallocation
    RESTLET = {string} restlet
    RETURN_AUTHORIZATION = {string} returnauthorization
    REVENUE_ARRANGEMENT = {string} revenuearrangement
    REVENUE_COMMITMENT = {string} revenuecommitment
    REVENUE_COMMITMENT_REVERSAL = {string} revenuecommitmentreversal
    REVENUE_PLAN = {string} revenueplan
    REV_REC_SCHEDULE = {string} revrecschedule
    REV_REC_TEMPLATE = {string} revrectemplate
    SALES_ORDER = {string} salesorder
    SALES_ROLE = {string} salesrole
    SALES_TAX_ITEM = {string} salestaxitem
    SCHEDULED_SCRIPT = {string} scheduledscript
    SCHEDULED_SCRIPT_INSTANCE = {string} scheduledscriptinstance
    SCRIPT_DEPLOYMENT = {string} scriptdeployment
    SERIALIZED_ASSEMBLY_ITEM = {string} serializedassemblyitem
    SERIALIZED_INVENTORY_ITEM = {string} serializedinventoryitem
    SERVICE_ITEM = {string} serviceitem
    SHIP_ITEM = {string} shipitem
    SOLUTION = {string} solution
    STATISTICAL_JOURNAL_ENTRY = {string} statisticaljournalentry
    STORE_PICKUP_FULFILLMENT = {string} storepickupfulfillment
    SUBSCRIPTION = {string} subscription
    SUBSCRIPTION_CHANGE_ORDER = {string} subscriptionchangeorder
    SUBSCRIPTION_LINE = {string} subscriptionline
    SUBSCRIPTION_PLAN = {string} subscriptionplan
    SUBSIDIARY = {string} subsidiary
    SUBTOTAL_ITEM = {string} subtotalitem
    SUITELET = {string} suitelet
    SUPPLY_CHAIN_SNAPSHOT = {string} supplychainsnapshot
    SUPPORT_CASE = {string} supportcase
    TASK = {string} task
    TAX_GROUP = {string} taxgroup
    TAX_PERIOD = {string} taxperiod
    TAX_TYPE = {string} taxtype
    TERM = {string} term
    TIME_BILL = {string} timebill
    TIME_ENTRY = {string} timeentry
    TIME_OFF_CHANGE = {string} timeoffchange
    TIME_OFF_PLAN = {string} timeoffplan
    TIME_OFF_REQUEST = {string} timeoffrequest
    TIME_OFF_RULE = {string} timeoffrule
    TIME_OFF_TYPE = {string} timeofftype
    TIME_SHEET = {string} timesheet
    TOPIC = {string} topic
    TRANSFER_ORDER = {string} transferorder
    UNITS_TYPE = {string} unitstype
    USAGE = {string} usage
    USEREVENT_SCRIPT = {string} usereventscript
    VENDOR = {string} vendor
    VENDOR_BILL = {string} vendorbill
    VENDOR_CATEGORY = {string} vendorcategory
    VENDOR_CREDIT = {string} vendorcredit
    VENDOR_PAYMENT = {string} vendorpayment
    VENDOR_RETURN_AUTHORIZATION = {string} vendorreturnauthorization
    VENDOR_SUBSIDIARY_RELATIONSHIP = {string} vendorsubsidiaryrelationship
    WEBSITE = {string} website
    WORKFLOW_ACTION_SCRIPT = {string} workflowactionscript
    WORK_ORDER = {string} workorder
    WORK_ORDER_CLOSE = {string} workorderclose
    WORK_ORDER_COMPLETION = {string} workordercompletion
    WORK_ORDER_ISSUE = {string} workorderissue
    WORKPLACE = {string} workplace
    CROSSCHARGEABLE = {string} Crosschargeable
    AGGR_FIN_DAT = {string} AggrFinDat
    FIN_RPT_AGGREGATE_F_R = {string} FinRptAggregateFR
    DELETED_RECORD = {string} DeletedRecord
    END_TO_END_TIME = {string} EndToEndTime
    EXPENSE_AMORT_PLAN_AND_SCHEDULE = {string} ExpenseAmortPlanAndSchedule
    REV_REC_PLAN_AND_SCHEDULE = {string} RevRecPlanAndSchedule
    BILLING_ACCOUNT_BILL_CYCLE = {string} BillingAccountBillCycle
    BILLING_ACCOUNT_BILL_REQUEST = {string} BillingAccountBillRequest
    BIN_ITEM_BALANCE = {string} BinItemBalance
    TIMESHEET_APPROVAL = {string} TimesheetApproval
    UBER = {string} Uber
    RES_ALLOCATION_TIME_OFF_CONFLICT = {string} ResAllocationTimeOffConflict
    COM_SEARCH_ONE_WAY_SYN = {string} ComSearchOneWaySyn
    COM_SEARCH_GROUP_SYN = {string} ComSearchGroupSyn
    COM_SEARCH_BOOST_TYPE = {string} ComSearchBoostType
    COM_SEARCH_BOOST = {string} ComSearchBoost
    GL_LINES_AUDIT_LOG = {string} GlLinesAuditLog
    INSTALLMENT = {string} Installment
    INVENTORY_BALANCE = {string} InventoryBalance
    INVENTORY_NUMBER_BIN = {string} InventoryNumberBin
    INVENTORY_NUMBER_ITEM = {string} InventoryNumberItem
    INVENTORY_STATUS_LOCATION = {string} InventoryStatusLocation
    INVT_NUMBER_ITEM_BALANCE = {string} InvtNumberItemBalance
    ITEM_BIN_NUMBER = {string} ItemBinNumber
    PAYMENT_EVENT = {string} PaymentEvent
    PERMISSION = {string} Permission
    GATEWAY_NOTIFICATION = {string} GatewayNotification
    PRICING = {string} Pricing
    RECENT_RECORD = {string} RecentRecord
    ROLE = {string} Role
    SAVED_SEARCH = {string} SavedSearch
    SHOPPING_CART = {string} ShoppingCart
    SUBSCRIPTION_RENEWAL_HISTORY = {string} SubscriptionRenewalHistory
    SUITE_SCRIPT_DETAIL = {string} SuiteScriptDetail
    SUPPLY_CHAIN_SNAPSHOT_DETAILS = {string} SupplyChainSnapshotDetails
    SYSTEM_NOTE = {string} SystemNote
    TAX_DETAIL = {string} TaxDetail
    TIME_APPROVAL = {string} TimeApproval
    PAYMENT_INSTRUMENT = {string} PaymentInstrument
    ENTITY = {string} entity
    ACTIVITY = {string} activity
    ITEM = {string} item
    TRANSACTION = {string} transaction
```

```
Operator:
    AFTER: "after"
    ALLOF: "allof"
    ANY: "any"
    ANYOF: "anyof"
    BEFORE: "before"
    BETWEEN: "between"
    CONTAINS: "contains"
    DOESNOTCONTAIN: "doesnotcontain"
    DOESNOTSTARTWITH: "doesnotstartwith"
    EQUALTO: "equalto"
    GREATERTHAN: "greaterthan"
    GREATERTHANOREQUALTO: "greaterthanorequalto"
    HASKEYWORDS: "haskeywords"
    IS: "is"
    ISEMPTY: "isempty"
    ISNOT: "isnot"
    ISNOTEMPTY: "isnotempty"
    LESSTHAN: "lessthan"
    LESSTHANOREQUALTO: "lessthanorequalto"
    NONEOF: "noneof"
    NOTAFTER: "notafter"
    NOTALLOF: "notallof"
    NOTBEFORE: "notbefore"
    NOTBETWEEN: "notbetween"
    NOTEQUALTO: "notequalto"
    NOTGREATERTHAN: "notgreaterthan"
    NOTGREATERTHANOREQUALTO: "notgreaterthanorequalto"
    NOTLESSTHAN: "notlessthan"
    NOTLESSTHANOREQUALTO: "notlessthanorequalto"
    NOTON: "noton"
    NOTONORAFTER: "notonorafter"
    NOTONORBEFORE: "notonorbefore"
    NOTWITHIN: "notwithin"
    ON: "on"
    ONORAFTER: "onorafter"
    ONORBEFORE: "onorbefore"
    STARTSWITH: "startswith"
    WITHIN: "within"
```

### 2. Logging and Debugging

- Note: This will show in exc log of script
```
	log.debug({
		title   : '***** Title *****',
		details : 'Description'
	});
```