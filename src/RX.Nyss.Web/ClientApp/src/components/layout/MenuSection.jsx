import { List, ListItem, ListItemText, ListItemIcon, ListSubheader, Divider, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { RcIcon } from '../icons/RcIcon';

const useStyles = makeStyles(() => ({
  SideMenuIcon: {
    fontSize: '26px',
    color: '#1E1E1E',
  },
  ListItemIconWrapper: {
    minWidth: '20px',
  },
  SideMenuText: {
    color: '#1E1E1E',
    fontSize: '16px',
  },
  SideMenuTextWrapper: {
    padding: '12px 12px 12px 16px',
  },
  ListItemActive: {
    backgroundColor: '#E3E3E3',
    "& span p": {
      fontWeight: '600',
    },
  },
  ListItem : {
    padding: '0 0 0 16px',
  },
  SubHeader : {
    color: '#1E1E1E',
    lineHeight: '28px',
    fontSize: 12,
    fontWeight: "bold",
    margin: "0 0 0px 8px",
    position: "relative"
  },
  Divider: {
    backgroundColor: '#B4B4B4',
  },
  Hide: {
    color: "transparent",
    userSelect: "none"
  }
}));

export const MenuSection = ({menuItems, handleItemClick, menuTitle, isExpanded}) => {
  const classes = useStyles();

  return(
    <List style={{ width: "inherit" }} component="nav" aria-label={`${menuTitle} navigation menu`}
      subheader={
      <>
        <ListSubheader component="div" id={menuTitle} className={`${classes.SubHeader} ${!isExpanded && classes.Hide}`} disableGutters>
          {menuTitle}
        </ListSubheader>
        <Divider className={classes.Divider}/>
      </>
    }>
    {menuItems.map((item) => {
      return (
        <ListItem key={`sideMenuItem_${item.title}`} className={`${classes.ListItem} ${item.isActive ? classes.ListItemActive : ''}`} button onClick={() => handleItemClick(item)} >
          <Tooltip title={item.title}>
            <ListItemIcon className={classes.ListItemIconWrapper}>
              {item.icon && <RcIcon icon={item.icon} className={`${classes.SideMenuIcon}`} />}
            </ListItemIcon>
          </Tooltip>
          <ListItemText
            primary={
              <Tooltip title={item.title}>
                <Typography className={classes.SideMenuText} noWrap>{item.title}</Typography>
              </Tooltip>}
            className={classes.SideMenuTextWrapper}/>
        </ListItem>
      )
    })}
  </List>
  )
}