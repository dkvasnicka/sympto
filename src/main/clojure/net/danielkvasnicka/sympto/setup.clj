(ns net.danielkvasnicka.sympto.setup
  (:use [clojure.tools.logging :only (info)])
  (:import (javax.servlet ServletContextListener)
           (javax.servlet.annotation WebListener)))

(def DBPATH_PROPERTY "org.basex.dbpath")
(def BASEX_DBPATH_PRODUCTION "basex")

(defn get-datadir []
  (let [dataDir (System/getenv "OPENSHIFT_DATA_DIR")]
    (if (= dataDir nil)
      "/Users/daniel/BaseXData"
      (str dataDir BASEX_DBPATH_PRODUCTION))))

(deftype ^{WebListener {}} SetupContextListener [] ServletContextListener

  (contextInitialized [this sce]
    (require 'net.danielkvasnicka.sympto.setup)
    (let [finalPath (get-datadir)]
      (-> sce .getServletContext (.setInitParameter DBPATH_PROPERTY finalPath))
      (info (str "BaseX dbpath: " finalPath))))

  (contextDestroyed [this sce]))