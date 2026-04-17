import frappe
from frappe.utils import flt

@frappe.whitelist()
def get_dashboard_stats():
    # Fetching Fiscal Year dates for GL Entry filters
    fiscal_year = frappe.db.get_default("fiscal_year") or frappe.db.get_value("Fiscal Year", {"disabled": 0}, "name", order_by="year_start_date desc")
    fy_dates = frappe.get_cached_value("Fiscal Year", fiscal_year, ["year_start_date", "year_end_date"], as_dict=True)

    # 1. Fetch all submitted Sales Invoices - Added base_net_total for Turnover Score
    invoices = frappe.get_all("Sales Invoice", 
        filters={"docstatus": 1}, 
        fields=["customer", "grand_total", "base_net_total", "customer_group"]
    )
    
    customer_data = {}
    govt_total_sales = 0
    # Logic Change: turnover_score will now represent the Net Total (before tax)
    total_turnover = 0
    
    for inv in invoices:
        # Turnover score logic using Net Total
        total_turnover += flt(inv.base_net_total)
        
        if inv.customer not in customer_data:
            is_govt = inv.customer_group == "Government"
            group = "Government" if is_govt else "Private"
            
            customer_data[inv.customer] = {
                "count": 0, 
                "total": 0, 
                "group": group
            }
        
        customer_data[inv.customer]["count"] += 1
        customer_data[inv.customer]["total"] += inv.grand_total
        
        if inv.customer_group == "Government":
            govt_total_sales += inv.grand_total

    # 2. Card Calculations (Unchanged as requested)
    existing_pvt = sum(d["total"] for d in customer_data.values() if d["count"] > 1 and d["group"] == "Private")
    new_client_total = sum(d["total"] for d in customer_data.values() if d["count"] == 1)
    new_pvt_count = len([c for c, d in customer_data.items() if d["count"] == 1 and d["group"] == "Private"])
    new_govt_count = len([c for c, d in customer_data.items() if d["count"] == 1 and d["group"] == "Government"])
    
    # 3. Dynamic Profit Score Calculation
    # Fetching Income and Expense sums from General Ledger
    income = frappe.db.get_value("GL Entry", {
        "posting_date": ["between", [fy_dates.year_start_date, fy_dates.year_end_date]],
        "is_cancelled": 0,
        "account": ["in", frappe.get_all("Account", filters={"root_type": "Income"}, pluck="name")]
    }, "sum(credit - debit)") or 0

    expense = frappe.db.get_value("GL Entry", {
        "posting_date": ["between", [fy_dates.year_start_date, fy_dates.year_end_date]],
        "is_cancelled": 0,
        "account": ["in", frappe.get_all("Account", filters={"root_type": "Expense"}, pluck="name")]
    }, "sum(debit - credit)") or 0

    # Profit % Logic: (Net Profit / Total Income) * 100
    net_profit = flt(income) - flt(expense)
    profit_score = round((net_profit / flt(income) * 100), 2) if flt(income) > 0 else 0

    return {
        "existing_pvt": existing_pvt,
        "new_client": new_client_total,
        "govt_total": govt_total_sales,
        "new_clients_pvt": new_pvt_count,
        "new_clients_govt": new_govt_count,
        "turnover_score": total_turnover,
        "profit_score": profit_score # Now returns dynamic percentage
    }