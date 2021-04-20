import React from 'react';
import PropTypes from 'prop-types';
import styles from './Marker.less';

const Marker = ({ text, onClick }) => (
  <div className={styles.marker} alt={text} onClick={onClick} />
);

Marker.defaultProps = {
  onClick: null,
};

Marker.propTypes = {
  onClick: PropTypes.func,
  text: PropTypes.string.isRequired,
};

export default Marker;
