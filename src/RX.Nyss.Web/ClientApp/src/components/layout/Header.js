import styles from './Header.module.scss';

import React from 'react';
import { connect } from "react-redux";
import { UserStatus } from './UserStatus';
import { Icon, useMediaQuery } from '@material-ui/core';
import { toggleSideMenu } from '../app/logic/appActions';

const HeaderComponent = ({ sideMenuOpen, toggleSideMenu, directionRtl, isSupervisor }) => {

  // Only return top header menu for supervisors and head supervisors since they will not have the sidemenu displayed. In addition, display top header for tablets and mobile devices for hamburger menu
  const isFullScreen = useMediaQuery('(min-width:1280px)');
  if(!isSupervisor && isFullScreen) return null;

  return (
    <div className={styles.header}>
      <div className={styles.placeholder}>
        <Icon className={styles.toggleMenu} onClick={() => toggleSideMenu(!sideMenuOpen)}>menu</Icon>
        <img className={`${styles.smallLogo} ${directionRtl ? styles.rtl : ''}`} src="/images/logo-small.svg" alt="Nyss logo" />
      </div>
      {isSupervisor && (
        <div className={styles.user}>
          <UserStatus />
      </div>
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  sideMenuOpen: state.appData.mobile.sideMenuOpen,
  directionRtl: state.appData.user.languageCode === 'ar',
  isSupervisor: state.appData.user.roles.includes("Supervisor") || state.appData.user.roles.includes("HeadSupervisor")
});

const mapDispatchToProps = {
  toggleSideMenu: toggleSideMenu
};

export const Header = connect(mapStateToProps, mapDispatchToProps)(HeaderComponent);
