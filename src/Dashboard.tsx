import { useState, type FormEvent } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Check,
  CircleDollarSign,
  LayoutDashboard,
  Plus,
  RotateCcw,
  Scale,
  Wallet,
  X,
} from "lucide-react";
import {
  usePartnership,
  type Branch,
  type TransactionType,
} from "./PartnershipContext";
const money = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n);
const branchNames = { Baghdad: "بغداد", Najaf: "النجف" };
const typeNames = {
  capital: "رأس مال",
  expense: "مصروفات",
  withdrawal: "سحب شخصي",
  revenue: "إيرادات",
};
export function Dashboard() {
  const data = usePartnership();
  const [modal, setModal] = useState(false),
    [filter, setFilter] = useState("all"),
    [search, setSearch] = useState(""),
    [notice, setNotice] = useState("");
  const [branch, setBranch] = useState<Branch>("Baghdad"),
    [type, setType] = useState<TransactionType>("capital"),
    [amount, setAmount] = useState(""),
    [description, setDescription] = useState(""),
    [partner, setPartner] = useState<"Wesam" | "Hussein">("Wesam"),
    [error, setError] = useState("");
  const status = data.reconciliationStatus;
  const rows = [...data.transactions]
    .reverse()
    .filter(
      (t) =>
        (filter === "all" || t.branch === filter) &&
        `${t.description} ${typeNames[t.type]}`.includes(search),
    );
  function openTransaction(selectedType: TransactionType = "capital") {
    setType(selectedType);
    setBranch("Baghdad");
    setAmount("");
    setDescription("");
    setPartner("Wesam");
    setError("");
    setModal(true);
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    try {
      data.addTransaction({
        branch,
        type,
        amount: Number(amount),
        description,
        partner: type === "withdrawal" ? partner : undefined,
      });
      setModal(false);
      setAmount("");
      setDescription("");
      setError("");
      setNotice("تمت إضافة الحركة وتحديث الأرصدة");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذرت إضافة الحركة");
    }
  }
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-icon">
            <Scale size={25} />
          </span>
          <span>
            ميزان<small>حسابات الشراكة</small>
          </span>
        </a>
        <div className="workspace">
          <span className="avatar">ش</span>
          <div>
            شراكة بغداد والنجف<small>مساحة العمل التجريبية</small>
          </div>
        </div>
        <p className="nav-label">إدارة الشراكة</p>
        <a className="nav-item active" href="#dashboard">
          <LayoutDashboard size={19} />
          نظرة عامة
        </a>
        <a className="nav-item" href="#transactions">
          <Wallet size={19} />
          سجل الحركات<span>{data.transactions.length}</span>
        </a>
        <a className="nav-item" href="#reconciliation">
          <Scale size={19} />
          المصالحة المالية
        </a>
        <div className="sidebar-bottom">
          <div className="demo-dot" />
          بيانات تجريبية محلية<small>بغداد · النجف</small>
        </div>
      </aside>
      <main id="dashboard">
        <header>
          <div className="breadcrumb">
            مساحة العمل <span>/</span> نظرة عامة
          </div>
          <span className="local-badge">
            <span />
            معاينة محلية
          </span>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">كل الحسابات، بصورة أوضح</div>
              <h1>نظرة عامة على الشراكة</h1>
              <p>تابع حركة الأموال بين الفرعين، وخلّي حساباتكم متوازنة.</p>
            </div>
            <button className="primary" onClick={() => openTransaction()}>
              <Plus size={19} />
              إضافة حركة
            </button>
          </div>
          <div
            className="mb-5 flex flex-wrap gap-2"
            aria-label="إضافة حركة حسب النوع"
          >
            {(
              [
                { type: "capital", label: "إضافة رأس مال", Icon: Wallet },
                { type: "expense", label: "إضافة مصروف", Icon: ArrowUpRight },
                {
                  type: "withdrawal",
                  label: "إضافة سحب",
                  Icon: CircleDollarSign,
                },
                { type: "revenue", label: "إضافة إيراد", Icon: ArrowDownLeft },
              ] as const
            ).map(({ type: transactionType, label, Icon }) => (
              <button
                key={transactionType}
                className="rounded-lg border border-emerald-900/10 bg-white px-4 py-3 text-xs text-emerald-900 transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                onClick={() => openTransaction(transactionType)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
          <div className="demo-banner">
            <span>
              <span className="demo-tag">نسخة تجريبية</span>جرّب إضافة حركة؛
              الأرصدة والمصالحة تتحدّث فوراً داخل هذه الصفحة.
            </span>
            <button
              className="reset"
              onClick={() => {
                data.resetDemo();
                setNotice("تمت استعادة البيانات التجريبية");
              }}
            >
              <RotateCcw size={14} />
              إعادة التجربة
            </button>
          </div>
          {notice && (
            <div className="notice" role="status">
              <Check size={16} />
              {notice}
              <button aria-label="إغلاق التنبيه" onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          )}
          <section className="stats">
            {[
              {
                label: "إجمالي رأس المال",
                value: data.totalCapital.total,
                icon: Wallet,
                color: "green",
              },
              {
                label: "إجمالي المصروفات",
                value: data.totalExpenses.total,
                icon: ArrowUpRight,
                color: "orange",
              },
              {
                label: "السحوبات الشخصية",
                value: data.totalWithdrawals.total,
                icon: CircleDollarSign,
                color: "purple",
              },
              {
                label: "إجمالي الإيرادات",
                value: data.totalRevenues.total,
                icon: ArrowDownLeft,
                color: "blue",
              },
            ].map((c) => (
              <div className="stat" key={c.label}>
                <div className="stat-top">
                  <span>{c.label}</span>
                  <span className={`stat-icon ${c.color}`}>
                    <c.icon size={19} />
                  </span>
                </div>
                <div className="stat-number" dir="ltr">
                  {money(c.value)} <small>د.ع</small>
                </div>
                <div className="stat-note">
                  الفرعان معاً <span>بغداد والنجف</span>
                </div>
              </div>
            ))}
          </section>
          <div className="balance-grid">
            <section className="panel branches">
              <div className="section-title">
                <h2>أرصدة الفروع</h2>
                <span>الرصيد النقدي المتبقي</span>
              </div>
              {(["Baghdad", "Najaf"] as const).map((b, i) => (
                <div className="branch-row" key={b}>
                  <div className={`branch-icon branch-${i}`}>
                    <Building2 size={22} />
                  </div>
                  <div className="branch-info">
                    <h3>فرع {branchNames[b]}</h3>
                    <p>رأس المال: {money(data.totalCapital[b])} د.ع</p>
                  </div>
                  <div className="branch-amount">
                    <strong dir="ltr">{money(data.netBalances[b])}</strong>
                    <small>دينار عراقي</small>
                  </div>
                </div>
              ))}
              <div className="formula">
                الرصيد = رأس المال + الإيرادات − المصروفات − السحوبات
              </div>
            </section>
            <section id="reconciliation" className="reconciliation">
              <div className="reconcile-heading">
                <span>
                  <Scale size={19} />
                  المصالحة المالية
                </span>
                <span className="automatic">حساب تلقائي</span>
              </div>
              <p className="reconcile-label">
                {status.from
                  ? "التحويل المقترح لتحقيق التوازن"
                  : "الحسابات متوازنة"}
              </p>
              <div className="transfer-amount" dir="ltr">
                {money(status.amount)} <small>د.ع</small>
              </div>
              <div className="transfer-route">
                {status.from && status.to ? (
                  <>
                    <span>فرع {branchNames[status.from]}</span>
                    <span className="route-arrow">←</span>
                    <span>فرع {branchNames[status.to]}</span>
                  </>
                ) : (
                  <span>
                    لا يوجد تحويل مطلوب <Check size={16} />
                  </span>
                )}
              </div>
              <p className="reconcile-help">
                توزيع الرصيد النقدي بالتساوي بين الفرعين. المبلغ المقترح يساوي
                نصف فرق الأرصدة؛ لا يمثل تسوية حصص الأرباح أو رأس المال.
              </p>
            </section>
          </div>
          <section id="transactions" className="panel transactions">
            <div className="table-heading">
              <div>
                <h2>آخر الحركات</h2>
                <p>سجل واضح لكل مبلغ يدخل أو يخرج من الشراكة</p>
              </div>
              <div className="table-controls">
                <input
                  aria-label="البحث في الحركات"
                  placeholder="ابحث عن حركة…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  aria-label="تصفية حسب الفرع"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">كل الفروع</option>
                  <option value="Baghdad">بغداد</option>
                  <option value="Najaf">النجف</option>
                </select>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>تفاصيل الحركة</th>
                    <th>النوع</th>
                    <th>الفرع</th>
                    <th>التاريخ</th>
                    <th>المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <div className="description-cell">
                          <span className={`row-icon ${t.type}`}>
                            <CircleDollarSign size={17} />
                          </span>
                          <div>
                            {t.description}
                            {t.partner && (
                              <small>
                                {t.partner === "Wesam" ? "وسام" : "حسين"}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge ${t.type}`}>
                          {typeNames[t.type]}
                        </span>
                      </td>
                      <td>
                        <span className="branch-cell">
                          <span
                            className={
                              t.branch === "Baghdad"
                                ? "baghdad-dot"
                                : "najaf-dot"
                            }
                          />{" "}
                          {branchNames[t.branch]}
                        </span>
                      </td>
                      <td className="date-cell">
                        {new Intl.DateTimeFormat("ar-IQ", {
                          day: "numeric",
                          month: "short",
                          timeZone: "Asia/Baghdad",
                        }).format(new Date(t.date))}
                      </td>
                      <td>
                        <strong className="table-amount" dir="ltr">
                          {money(t.amount)} <small>د.ع</small>
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && (
                <div className="empty">لا توجد حركات مطابقة للبحث.</div>
              )}
            </div>
            <div className="table-footer">
              عرض {rows.length} من {data.transactions.length} حركات{" "}
              <span>تُمسح التغييرات عند تحديث الصفحة</span>
            </div>
          </section>
          <footer>
            ميزان · حسابات أوضح، شراكة أقوى
            <span>نموذج تفاعلي · بدون اتصال بقاعدة بيانات</span>
          </footer>
        </div>
      </main>
      {modal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setModal(false);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-title">
              <div>
                <h2 id="modal-title">إضافة حركة جديدة</h2>
                <p>ستُحدّث الأرصدة والمصالحة تلقائياً.</p>
              </div>
              <button aria-label="إغلاق" onClick={() => setModal(false)}>
                <X />
              </button>
            </div>
            <form onSubmit={submit}>
              <div className="form-grid">
                <label>
                  الفرع
                  <select
                    autoFocus
                    value={branch}
                    onChange={(e) => setBranch(e.target.value as Branch)}
                  >
                    <option value="Baghdad">بغداد</option>
                    <option value="Najaf">النجف</option>
                  </select>
                </label>
                <label>
                  نوع الحركة
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType)}
                  >
                    {Object.entries(typeNames).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                المبلغ بالدينار العراقي
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="مثال: 500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              {type === "withdrawal" && (
                <label>
                  الشريك
                  <select
                    value={partner}
                    onChange={(e) =>
                      setPartner(e.target.value as "Wesam" | "Hussein")
                    }
                  >
                    <option value="Wesam">وسام</option>
                    <option value="Hussein">حسين</option>
                  </select>
                </label>
              )}
              <label>
                وصف الحركة
                <input
                  required
                  maxLength={160}
                  placeholder="اكتب تفاصيل الحركة"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <div className="modal-actions">
                <button className="primary" type="submit">
                  <Check size={18} />
                  حفظ الحركة
                </button>
                <button
                  className="secondary"
                  type="button"
                  onClick={() => setModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
