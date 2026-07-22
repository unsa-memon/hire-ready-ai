import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Clock, ExternalLink, Search, Activity, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function History() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('activity_history')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setActivities(data);
      } catch (error) {
        console.error("Error fetching history:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser.id]);

  const filteredActivities = useMemo(() => {
    return activities.filter(item => 
      item.activity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activities, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground mt-2 max-w-xl leading-relaxed">
            A secure immutable history mapping every artificial intelligence augmentation processed historically.
          </p>
        </div>
        <div className="w-full md:w-80 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </div>
          <Input 
            type="text"
            placeholder="Search records..." 
            className="pl-10 h-11 bg-surface-50/50 dark:bg-surface-900/50 border-border/50 focus:border-primary shadow-sm rounded-xl transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="glass-card shadow-xl border-border/40 overflow-hidden relative">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <CardContent className="p-0">
          <div className="w-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <div className="w-12 h-12 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin mb-4"></div>
                <p>Decrypting historical ledger...</p>
              </div>
            ) : filteredActivities.length > 0 ? (
              <div className="divide-y divide-border/30">
                {filteredActivities.map((item) => (
                  <div key={item.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 hover:bg-surface-50/80 dark:hover:bg-surface-900/80 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -translate-x-full group-hover:translate-x-0"></div>
                    
                    <div className="flex items-start gap-5 relative z-10 w-full sm:w-auto">
                      <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground shadow-sm group-hover:shadow-primary/30 transition-all duration-300 flex-shrink-0">
                        <Activity size={20} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <h3 className="font-bold capitalize text-foreground tracking-tight text-lg group-hover:text-primary transition-colors">
                              {item.activity_type.replace(/_/g, ' ')}
                           </h3>
                           <Badge variant="outline" className="hidden md:inline-flex text-[10px] uppercase font-bold tracking-wider opacity-60">
                              Verified
                           </Badge>
                        </div>
                        <p className="text-[15px] text-muted-foreground w-full max-w-xl leading-relaxed">
                           {item.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end w-full sm:w-auto justify-between mt-4 sm:mt-0 gap-2 relative z-10 border-t sm:border-0 border-border/20 pt-4 sm:pt-0">
                      <time className="text-xs font-mono font-medium text-muted-foreground/70 bg-surface-100/50 dark:bg-surface-800/50 px-2.5 py-1 rounded-md border border-border/30">
                         {new Date(item.created_at).toLocaleDateString()} &middot; {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                      {item.link_url && (
                        <Link to={item.link_url} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-cyan-500 transition-colors group/link px-3 py-1.5 rounded-lg hover:bg-primary/5">
                          View Analysis <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                 <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-muted-foreground/50 mb-4 rotate-3 border border-border/50 shadow-inner">
                    <Search size={24} className="-rotate-3" />
                 </div>
                 <h3 className="text-lg font-bold text-foreground mb-1">No Records Found</h3>
                 <p className="text-muted-foreground text-sm max-w-sm">No historical data matching your query was structurally identified.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
