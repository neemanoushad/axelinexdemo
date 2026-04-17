frappe.pages['executive-dashboard'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Turnover - FY 25/26',
        single_column: true
    });

    let html_content = `
    <div class="dashboard-container" style="padding: 20px; background: #f8f9fa;">
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:8px; display:flex; align-items:center; border:1px solid #dee2e6;">
                    <i class="fa fa-play" style="color:#1a4a7c; margin-right:15px; font-size:20px;"></i>
                    <div>
                        <div style="font-weight:bold; font-size:12px; color:#1a4a7c;">EXISTING CLIENT (PVT)</div>
                        <div style="font-size:14px; color:#444; margin-top:5px;">TOTAL SALES: <span id="existing-pvt" style="font-weight:700;">0</span>/-</div>
                    </div>
                </div>
            </div>

            <div class="col-md-4 mb-4">
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:8px; display:flex; align-items:center; border:1px solid #dee2e6;">
                    <i class="fa fa-play" style="color:#1a4a7c; margin-right:15px; font-size:20px;"></i>
                    <div>
                        <div style="font-weight:bold; font-size:12px; color:#1a4a7c;">NEW CLIENT</div>
                        <div style="font-size:14px; color:#444; margin-top:5px;">TOTAL SALES: <span id="new-client" style="font-weight:700;">0</span>/-</div>
                    </div>
                </div>
            </div>

            <div class="col-md-4 mb-4">
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:8px; display:flex; align-items:center; border:1px solid #dee2e6;">
                    <i class="fa fa-play" style="color:#1a4a7c; margin-right:15px; font-size:20px;"></i>
                    <div>
                        <div style="font-weight:bold; font-size:12px; color:#1a4a7c;">GOVERNMENT</div>
                        <div style="font-size:14px; color:#444; margin-top:5px;">TOTAL SALES: <span id="govt-total" style="font-weight:700;">0</span>/-</div>
                    </div>
                </div>
            </div>

            <div class="col-md-4 mb-4">
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:8px; display:flex; align-items:center; border:1px solid #dee2e6;">
                    <i class="fa fa-play" style="color:#1a4a7c; margin-right:15px; font-size:20px;"></i>
                    <div>
                        <div style="font-weight:bold; font-size:12px; color:#1a4a7c;">NO: OF NEW CLIENTS</div>
                        <div style="font-size:14px; color:#444; margin-top:5px;">
                            PRIVATE - <span id="count-pvt" style="font-weight:700; color:#1a4a7c;">0</span> 
                            GOVERNMENT - <span id="count-govt" style="font-weight:700; color:#1a4a7c;">0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    $(html_content).appendTo(wrapper.page.main);

    frappe.call({
        method: "tridax.tridaxapp.api.get_dashboard_stats",
        callback: function(r) {
            if (r.message) {
                let d = r.message;
                const f = (v) => format_currency(v, "INR").replace("₹", "").trim();

                $(wrapper).find('#existing-pvt').text(f(d.existing_pvt));
                $(wrapper).find('#new-client').text(f(d.new_client));
                $(wrapper).find('#govt-total').text(f(d.govt_total));
                $(wrapper).find('#count-pvt').text(d.new_clients_pvt);
                $(wrapper).find('#count-govt').text(d.new_clients_govt);
            }
        }
    });
}