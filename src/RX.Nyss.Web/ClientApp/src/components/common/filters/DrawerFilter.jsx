import React, { useState, useRef } from 'react';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import Backdrop from '@material-ui/core/Backdrop';
import { Typography, makeStyles } from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 5,
    overflowX: "hidden",
    maxHeight: 350,
    overflowY: "auto",
  },
  pullTabContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  pullTab: {
    height: 5,
    borderRadius: 8,
    width: 50,
    backgroundColor: theme.palette.grey[400],
    margin: "10px 0px",
  },
  root: {
    overflowY: "scroll"
  },
  backdrop: {
    zIndex: theme.zIndex.drawer - 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropClass: {
    backgroundColor: "transparent"
  }
}));

export const DrawerFilter = ({ children, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const classes = useStyles()
  const [startY, setStartY] = useState(null);
  const drawerRef = useRef(null);

  const handleTouchStart = (event) => {
    setStartY(event.touches[0].clientY);
  };

  const handleTouchMove = (event) => {
    if (startY !== null) {
      const currentY = event.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0 && drawerRef.current && drawerRef.current.style) {
        drawerRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };
  const handleDrawerTransitionEnd = () => {
    if (!isOpen && drawerRef.current && drawerRef.current.style) {
      drawerRef.current.style.transition = ''; // Reset transition property
      drawerRef.current.style.transform = ''; // Reset transform property
    }
  };

  const handleTouchEnd = (event) => {
    if (startY !== null) {
      // You can adjust the threshold for closing the drawer as needed
      const threshold = 200;
      const currentY = event.changedTouches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > threshold) {
        // Close the drawer when dragging down
        setIsOpen(false);
      } else {
        // Reset styles if not closing
        if (drawerRef.current && drawerRef.current.style) {
          drawerRef.current.style.transform = '';
        }
      }
      setStartY(null);
    }
  };

  const toggleDrawer = (open) => {
    setIsOpen(open);
  };

  return (
    <div>
      <Button color='primary' variant="outlined" onClick={() => toggleDrawer(true)}>Filter</Button>
      <Drawer
        ref={drawerRef}
        anchor={"bottom"}
        open={isOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={() => toggleDrawer(false)}
        onOpen={() => toggleDrawer(true)}
        BackdropProps={{
          classes: {
            root: classes.backdropClass,
          }
        }}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        >
        <div className={classes.pullTabContainer} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className={classes.pullTab} />
          <Typography variant='h6' style={{ marginBottom: 15, alignSelf: "center" }}>{`Filter ${title}`}</Typography>
        </div>
        <div
          role="presentation"
          className={classes.container}
        >
          {children}
        </div>
      </Drawer>
      <Backdrop className={classes.backdrop} open={isOpen} onClick={() => toggleDrawer(false)} />
    </div>
  );
}