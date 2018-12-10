# 为编译 EOSIO 降级 boost 到 1.67

## 限定

本文适用于 macOS Mojave 系统，其它系统请自行做相应修改。

## 问题

目前 EOSIO 1.5 依赖的 boost 版本为 1.67，但最新的 boost 是 1.68，如果不小心用 `brew upgrade` 把 boost 升级到最新，则 EOSIO 代码将无法顺利编译。

## 解决方案

不必删除 1.68 版本，当之前安装过 1.67，再安装 1.68 时，其实两者是同时存在的，只是系统目录下的链接是指向最新版本而已。只要把链接改回 1.67 即可。

``` bash
ln -s /usr/local/include/boost /usr/local/Cellar/boost/1.67.0_1/include/boost 

ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_atomic-mt.a /usr/local/lib/libboost_atomic-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_atomic-mt.dylib /usr/local/lib/libboost_atomic-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_chrono-mt.a /usr/local/lib/libboost_chrono-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_chrono-mt.dylib /usr/local/lib/libboost_chrono-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_chrono.a /usr/local/lib/libboost_chrono.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_chrono.dylib /usr/local/lib/libboost_chrono.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_container-mt.a /usr/local/lib/libboost_container-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_container-mt.dylib /usr/local/lib/libboost_container-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_container.a /usr/local/lib/libboost_container.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_container.dylib /usr/local/lib/libboost_container.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_context-mt.a /usr/local/lib/libboost_context-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_context-mt.dylib /usr/local/lib/libboost_context-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_contract-mt.a /usr/local/lib/libboost_contract-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_contract-mt.dylib /usr/local/lib/libboost_contract-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_contract.a /usr/local/lib/libboost_contract.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_contract.dylib /usr/local/lib/libboost_contract.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_coroutine-mt.a /usr/local/lib/libboost_coroutine-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_coroutine-mt.dylib /usr/local/lib/libboost_coroutine-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_coroutine.a /usr/local/lib/libboost_coroutine.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_coroutine.dylib /usr/local/lib/libboost_coroutine.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_date_time-mt.a /usr/local/lib/libboost_date_time-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_date_time-mt.dylib /usr/local/lib/libboost_date_time-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_date_time.a /usr/local/lib/libboost_date_time.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_date_time.dylib /usr/local/lib/libboost_date_time.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_exception-mt.a /usr/local/lib/libboost_exception-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_exception.a /usr/local/lib/libboost_exception.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_fiber-mt.a /usr/local/lib/libboost_fiber-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_fiber-mt.dylib /usr/local/lib/libboost_fiber-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_filesystem-mt.a /usr/local/lib/libboost_filesystem-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_filesystem-mt.dylib /usr/local/lib/libboost_filesystem-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_filesystem.a /usr/local/lib/libboost_filesystem.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_filesystem.dylib /usr/local/lib/libboost_filesystem.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_graph-mt.a /usr/local/lib/libboost_graph-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_graph-mt.dylib /usr/local/lib/libboost_graph-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_graph.a /usr/local/lib/libboost_graph.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_graph.dylib /usr/local/lib/libboost_graph.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_iostreams-mt.a /usr/local/lib/libboost_iostreams-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_iostreams-mt.dylib /usr/local/lib/libboost_iostreams-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_iostreams.a /usr/local/lib/libboost_iostreams.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_iostreams.dylib /usr/local/lib/libboost_iostreams.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_locale-mt.a /usr/local/lib/libboost_locale-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_locale-mt.dylib /usr/local/lib/libboost_locale-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_log-mt.a /usr/local/lib/libboost_log-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_log-mt.dylib /usr/local/lib/libboost_log-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_log.a /usr/local/lib/libboost_log.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_log.dylib /usr/local/lib/libboost_log.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_log_setup-mt.a /usr/local/lib/libboost_log_setup-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_log_setup-mt.dylib /usr/local/lib/libboost_log_setup-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_log_setup.a /usr/local/lib/libboost_log_setup.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_log_setup.dylib /usr/local/lib/libboost_log_setup.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_c99-mt.a /usr/local/lib/libboost_math_c99-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_c99-mt.dylib /usr/local/lib/libboost_math_c99-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_c99.a /usr/local/lib/libboost_math_c99.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_c99.dylib /usr/local/lib/libboost_math_c99.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_c99f-mt.a /usr/local/lib/libboost_math_c99f-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_c99f-mt.dylib /usr/local/lib/libboost_math_c99f-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_c99f.a /usr/local/lib/libboost_math_c99f.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_c99f.dylib /usr/local/lib/libboost_math_c99f.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_c99l-mt.a /usr/local/lib/libboost_math_c99l-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_c99l-mt.dylib /usr/local/lib/libboost_math_c99l-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_c99l.a /usr/local/lib/libboost_math_c99l.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_c99l.dylib /usr/local/lib/libboost_math_c99l.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_tr1-mt.a /usr/local/lib/libboost_math_tr1-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_tr1-mt.dylib /usr/local/lib/libboost_math_tr1-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_tr1.a /usr/local/lib/libboost_math_tr1.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_tr1.dylib /usr/local/lib/libboost_math_tr1.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_tr1f-mt.a /usr/local/lib/libboost_math_tr1f-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_tr1f-mt.dylib /usr/local/lib/libboost_math_tr1f-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_tr1f.a /usr/local/lib/libboost_math_tr1f.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_tr1f.dylib /usr/local/lib/libboost_math_tr1f.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_tr1l-mt.a /usr/local/lib/libboost_math_tr1l-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_tr1l-mt.dylib /usr/local/lib/libboost_math_tr1l-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_tr1l.a /usr/local/lib/libboost_math_tr1l.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_math_tr1l.dylib /usr/local/lib/libboost_math_tr1l.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_prg_exec_monitor-mt.a /usr/local/lib/libboost_prg_exec_monitor-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_prg_exec_monitor-mt.dylib /usr/local/lib/libboost_prg_exec_monitor-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_prg_exec_monitor.a /usr/local/lib/libboost_prg_exec_monitor.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_prg_exec_monitor.dylib /usr/local/lib/libboost_prg_exec_monitor.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_program_options-mt.a /usr/local/lib/libboost_program_options-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_program_options-mt.dylib /usr/local/lib/libboost_program_options-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_program_options.a /usr/local/lib/libboost_program_options.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_program_options.dylib /usr/local/lib/libboost_program_options.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_random-mt.a /usr/local/lib/libboost_random-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_random-mt.dylib /usr/local/lib/libboost_random-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_random.a /usr/local/lib/libboost_random.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_random.dylib /usr/local/lib/libboost_random.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_regex-mt.a /usr/local/lib/libboost_regex-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_regex-mt.dylib /usr/local/lib/libboost_regex-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_regex.a /usr/local/lib/libboost_regex.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_regex.dylib /usr/local/lib/libboost_regex.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_serialization-mt.a /usr/local/lib/libboost_serialization-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_serialization-mt.dylib /usr/local/lib/libboost_serialization-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_serialization.a /usr/local/lib/libboost_serialization.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_serialization.dylib /usr/local/lib/libboost_serialization.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_signals-mt.a /usr/local/lib/libboost_signals-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_signals-mt.dylib /usr/local/lib/libboost_signals-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_signals.a /usr/local/lib/libboost_signals.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_signals.dylib /usr/local/lib/libboost_signals.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_stacktrace_addr2line-mt.a /usr/local/lib/libboost_stacktrace_addr2line-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_stacktrace_addr2line-mt.dylib /usr/local/lib/libboost_stacktrace_addr2line-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_stacktrace_addr2line.a /usr/local/lib/libboost_stacktrace_addr2line.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_stacktrace_addr2line.dylib /usr/local/lib/libboost_stacktrace_addr2line.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_stacktrace_basic-mt.a /usr/local/lib/libboost_stacktrace_basic-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_stacktrace_basic-mt.dylib /usr/local/lib/libboost_stacktrace_basic-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_stacktrace_basic.a /usr/local/lib/libboost_stacktrace_basic.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_stacktrace_basic.dylib /usr/local/lib/libboost_stacktrace_basic.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_stacktrace_noop-mt.a /usr/local/lib/libboost_stacktrace_noop-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_stacktrace_noop-mt.dylib /usr/local/lib/libboost_stacktrace_noop-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_stacktrace_noop.a /usr/local/lib/libboost_stacktrace_noop.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_stacktrace_noop.dylib /usr/local/lib/libboost_stacktrace_noop.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_system-mt.a /usr/local/lib/libboost_system-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_system-mt.dylib /usr/local/lib/libboost_system-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_system.a /usr/local/lib/libboost_system.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_system.dylib /usr/local/lib/libboost_system.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_test_exec_monitor-mt.a /usr/local/lib/libboost_test_exec_monitor-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_test_exec_monitor.a /usr/local/lib/libboost_test_exec_monitor.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_thread-mt.a /usr/local/lib/libboost_thread-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_thread-mt.dylib /usr/local/lib/libboost_thread-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_timer-mt.a /usr/local/lib/libboost_timer-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_timer-mt.dylib /usr/local/lib/libboost_timer-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_timer.a /usr/local/lib/libboost_timer.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_timer.dylib /usr/local/lib/libboost_timer.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_type_erasure-mt.a /usr/local/lib/libboost_type_erasure-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_type_erasure-mt.dylib /usr/local/lib/libboost_type_erasure-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_type_erasure.a /usr/local/lib/libboost_type_erasure.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_type_erasure.dylib /usr/local/lib/libboost_type_erasure.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_unit_test_framework-mt.a /usr/local/lib/libboost_unit_test_framework-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_unit_test_framework-mt.dylib /usr/local/lib/libboost_unit_test_framework-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_unit_test_framework.a /usr/local/lib/libboost_unit_test_framework.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_unit_test_framework.dylib /usr/local/lib/libboost_unit_test_framework.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_wave-mt.a /usr/local/lib/libboost_wave-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_wave-mt.dylib /usr/local/lib/libboost_wave-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_wserialization-mt.a /usr/local/lib/libboost_wserialization-mt.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_wserialization-mt.dylib /usr/local/lib/libboost_wserialization-mt.dylib
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_wserialization.a /usr/local/lib/libboost_wserialization.a
ln -f /usr/local/Cellar/boost/1.67.0_1/lib/libboost_wserialization.dylib /usr/local/lib/libboost_wserialization.dylib
```