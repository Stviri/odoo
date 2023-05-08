/** @odoo-module **/

import publicWidget from '@web/legacy/js/public/public_widget';
import { renderToElement } from '@web/core/utils/render';
import { markup } from "@odoo/owl";
import { _t } from '@web/core/l10n/translation';

publicWidget.registry.PaymentPostProcessing = publicWidget.Widget.extend({
    selector: 'div[name="o_payment_status"]',

    timeout: 0,
    pollCount: 0,

    async start() {
        this.call('ui', 'block', {
            'message': _t("We are processing your payment. Please wait."),
        });
        this._poll();
        return this._super.apply(this, arguments);
    },

    _poll() {
        this._updateTimeout();
        setTimeout(() => {
            // Fetch the post-processing values from the server.
            const self = this;
            this._rpc({
                route: '/payment/status/poll',
                params: {
                    'csrf_token': odoo.csrf_token,
                }
            }).then(postProcessingValues => {
                let { state, display_message, landing_route } = postProcessingValues;

                // Display the transaction details before redirection to show something ASAP.
                if (display_message) {
                    postProcessingValues.display_message = markup(display_message);
                }
                this._renderTemplate('payment.transactionDetails', postProcessingValues);

                // Redirect the user to the landing route if the transaction reached a final state.
                if (self._getFinalStates(postProcessingValues['provider_code']).includes(state)) {
                    window.location = landing_route;
                } else {
                    self._poll();
                }
            }).guardedCatch(error => {
                error.event.preventDefault();
                if (error.message.data) { // Server error.
                    switch (error.message.data.message) {
                        case 'retry':
                            self._poll();
                            break;
                        case 'tx_not_found':
                            self._renderTemplate('payment.tx_not_found');
                            break;
                        default:
                            self._renderTemplate(
                                'payment.exception', { error_message: error.message.data.message }
                            );
                            break;
                    }
                } else { // RPC error (server unreachable).
                    self._renderTemplate('payment.rpc_error');
                    self._poll();
                }
            });
        }, this.timeout);
    },

    _getFinalStates(providerCode) {
        return ['authorized', 'done'];
    },

    _updateTimeout() {
        if (this.pollCount >= 1 && this.pollCount < 10) {
            this.timeout = 3000;
        }
        if (this.pollCount >= 10 && this.pollCount < 20) {
            this.timeout = 10000;
        }
        else if (this.pollCount >= 20) {
            this.timeout = 30000;
        }
        this.pollCount++;
    },

    _renderTemplate(xmlid, display_values={}) {
        this.call('ui', 'unblock');
        const statusContainer = document.querySelector('div[name="o_payment_status_content"]');
        statusContainer.innerHTML = renderToElement(xmlid, display_values).innerHTML;
    },

});

export default publicWidget.registry.PaymentPostProcessing;
