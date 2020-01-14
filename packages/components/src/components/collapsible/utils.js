import PropTypes from 'prop-types';

export const positionPropType = {
    position: PropTypes.oneOf([
        'top',
        'bottom',
    ]),
};

export const animateChartControls = ({ chart_controls_el, is_open }) => {
    if (!chart_controls_el) return;
    if (is_open) {
        chart_controls_el.style.transition = 'all 0.3s linear';
        chart_controls_el.style.visibility = 'visible';
        chart_controls_el.style.opacity    = '1';
    } else {
        chart_controls_el.style.transition = 'all 0.3s linear';
        chart_controls_el.style.visibility = 'hidden';
        chart_controls_el.style.opacity    = '0';
    }
};
