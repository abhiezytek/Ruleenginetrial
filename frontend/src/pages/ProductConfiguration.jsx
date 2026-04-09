import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { ProductBadge } from '../components/shared/StatusBadge';
import { EmptyState } from '../components/shared/EmptyState';
import { PageLoader } from '../components/shared/LoadingSpinner';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getRules, getScorecards, getGrids,
  getProductMappings, saveProductWithMappings, updateProductWithMappings,
  getMedicalTriggers, saveMedicalTriggers, getGridMappings, getScorecardMappings
} from '../lib/api';
import { PRODUCT_TYPES } from '../lib/constants';
import { toast } from 'sonner';
import {
  Plus, Package, Edit, Trash2, Save, Settings2,
  GitBranch, RefreshCw, Search, Stethoscope,
} from 'lucide-react';
import RuleMappingPanel from '../components/product/RuleMappingPanel';
import MedicalTriggerPanel from '../components/product/MedicalTriggerPanel';

// ─── helpers ─────────────────────────────────────────────────────────────────
const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(v || 0);

const EMPTY_FORM = {
  code: '', name: '', product_type: 'term_life', description: '',
  min_age: 18, max_age: 65,
  min_sum_assured: 100000, max_sum_assured: 10000000,
  min_premium: 1000, is_enabled: true,
};
const EMPTY_MAPPINGS = { rules: [], grids: [], scorecards: [] };
const EMPTY_TRIGGERS = [];

// ─── ProductCard ─────────────────────────────────────────────────────────────
const ProductCard = React.memo(function ProductCard({ product, onEdit, onDelete }) {
  const totalMapped =
    (product.mapped_rules?.length || 0) +
    (product.mapped_grids?.length || 0) +
    (product.mapped_scorecards?.length || 0);
  const triggerCount = product.medical_trigger_count || 0;

  return (
    <Card className="border shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-sm font-semibold truncate">{product.name}</CardTitle>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="text-xs">{product.code}</Badge>
              <ProductBadge type={product.product_type} />
              {!product.is_enabled && (
                <Badge variant="secondary" className="text-xs">Disabled</Badge>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(product)}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button" variant="ghost" size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(product)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4 text-xs text-muted-foreground">
        <div className="grid grid-cols-2 gap-y-2">
          <div><span className="font-medium text-foreground block">Age Range</span>{product.min_age} – {product.max_age} yrs</div>
          <div><span className="font-medium text-foreground block">Min Premium</span>{formatCurrency(product.min_premium)}</div>
          <div><span className="font-medium text-foreground block">Min SA</span>{formatCurrency(product.min_sum_assured)}</div>
          <div><span className="font-medium text-foreground block">Max SA</span>{formatCurrency(product.max_sum_assured)}</div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {totalMapped > 0 && (
            <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1">
              <GitBranch className="h-3 w-3 text-primary shrink-0" />
              <span><strong>{totalMapped}</strong> mapped</span>
            </div>
          )}
          {triggerCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-md border bg-rose-50 border-rose-200 px-2 py-1 text-rose-700">
              <Stethoscope className="h-3 w-3 shrink-0" />
              <span><strong>{triggerCount}</strong> medical trigger{triggerCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        )}
      </CardContent>
    </Card>
  );
});

const FieldError = ({ msg }) =>
  msg ? <p className="text-xs text-destructive mt-0.5">{msg}</p> : null;

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProductConfiguration = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [mappings, setMappings] = useState(EMPTY_MAPPINGS);
  const [triggers, setTriggers] = useState(EMPTY_TRIGGERS);
  const [assets, setAssets] = useState({ rules: [], grids: [], scorecards: [] });
  const [errors, setErrors] = useState({});

  // ── fetch products ──────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(res.data || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── fetch assets ────────────────────────────────────────────────────────────
  const fetchAssets = useCallback(async () => {
    setAssetsLoading(true);
    try {
      const [rulesRes, gridsRes, scorecardsRes] = await Promise.allSettled([
        getRules(), getGrids(), getScorecards(),
      ]);
      setAssets({
        rules: rulesRes.status === 'fulfilled' ? (rulesRes.value?.data || []) : [],
        grids: gridsRes.status === 'fulfilled' ? (gridsRes.value?.data || []) : [],
        scorecards: scorecardsRes.status === 'fulfilled' ? (scorecardsRes.value?.data || []) : [],
      });
    } catch {
      toast.error('Could not load rules / grids / scorecards');
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  // ── open create ─────────────────────────────────────────────────────────────
  const openCreateDialog = useCallback(() => {
    setSelectedProduct(null);
    setFormData(EMPTY_FORM);
    setMappings(EMPTY_MAPPINGS);
    setTriggers(EMPTY_TRIGGERS);
    setErrors({});
    setActiveTab('details');
    setDialogOpen(true);
    fetchAssets();
  }, [fetchAssets]);

  // ── open edit ───────────────────────────────────────────────────────────────
  const openEditDialog = useCallback(async (product) => {
    setSelectedProduct(product);
    setFormData({
      code: product.code, name: product.name,
      product_type: product.product_type,
      description: product.description || '',
      min_age: product.min_age, max_age: product.max_age,
      min_sum_assured: product.min_sum_assured,
      max_sum_assured: product.max_sum_assured,
      min_premium: product.min_premium,
      is_enabled: product.is_enabled,
    });
    setErrors({});
    setActiveTab('details');
    setDialogOpen(true);
    fetchAssets();

    // load existing mappings + triggers in parallel
    const [mapRes, gridRes, scorecardRes] = await Promise.allSettled([
      getProductMappings(product.id),
      // getMedicalTriggers(product.id),
      getGridMappings(product.id),
      getScorecardMappings(product.id)
    ]);
    setMappings({
      rules: mapRes.status === 'fulfilled' ? (mapRes.value?.data?.rule_ids || []) : [],
      grids: gridRes.status === 'fulfilled' ? (gridRes.value?.data?.grid_ids || []) : [],
      scorecards: scorecardRes.status === 'fulfilled' ? (scorecardRes.value?.data?.scorecard_ids || []) : [],
    });
    // setTriggers(trigRes.status === 'fulfilled' ? (trigRes.value?.data || []) : []);
    setTriggers(mapRes.status === 'fulfilled' ? (mapRes.value?.data?.medical_triggers || []) : []);
  }, [fetchAssets]);

  // ── open delete ─────────────────────────────────────────────────────────────
  const openDeleteDialog = useCallback((product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  }, []);

  // ── field change ────────────────────────────────────────────────────────────
  const updateField = useCallback((field) => (eOrVal) => {
    const value = typeof eOrVal === 'object' && eOrVal?.target ? eOrVal.target.value : eOrVal;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  // ── validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!formData.code.trim()) errs.code = 'Product Code is required';
    if (!formData.name.trim()) errs.name = 'Product Name is required';
    if (!formData.product_type) errs.product_type = 'Product Type is required';
    if (!formData.min_age) errs.min_age = 'Min Age is required';
    if (!formData.max_age) errs.max_age = 'Max Age is required';
    if (Number(formData.min_age) >= Number(formData.max_age))
      errs.max_age = 'Max Age must be greater than Min Age';
    if (!formData.min_sum_assured) errs.min_sum_assured = 'Min Sum Assured is required';
    if (!formData.max_sum_assured) errs.max_sum_assured = 'Max Sum Assured is required';
    if (Number(formData.min_sum_assured) >= Number(formData.max_sum_assured))
      errs.max_sum_assured = 'Max Sum Assured must be greater than Min Sum Assured';

    // medical trigger validation
    const badTriggers = triggers.filter(
      (t) => !t.field || !t.operator || t.value === '' || t.required_tests.length === 0
    );
    if (badTriggers.length > 0) {
      errs.triggers = `${badTriggers.length} medical trigger(s) are incomplete — please fill all fields and select at least one test.`;
    }
    return errs;
  };

  // ── save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      if (errs.triggers) {
        toast.error(errs.triggers);
        setActiveTab('medical');
      }
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        min_age: Number(formData.min_age),
        max_age: Number(formData.max_age),
        min_sum_assured: Number(formData.min_sum_assured),
        max_sum_assured: Number(formData.max_sum_assured),
        min_premium: Number(formData.min_premium),
        mapped_rule_ids: mappings.rules,
        mapped_grid_ids: mappings.grids,
        mapped_scorecard_ids: mappings.scorecards,
        medical_triggers: triggers.map(({ id, ...rest }) => rest),
      };

      if (selectedProduct) {
        await updateProductWithMappings(selectedProduct.id, payload);
        toast.success('Product updated with mappings and medical triggers');
      } else {
        await saveProductWithMappings(payload);
        toast.success('Product created with mappings and medical triggers');
      }

      setDialogOpen(false);
      fetchProducts();
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  // ── delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id);
      toast.success('Product deleted');
      setDeleteDialogOpen(false);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase()) ||
      p.product_type?.toLowerCase().includes(search.toLowerCase())
  );

  const totalMapped = Object.values(mappings).flat().length;
  const activeTriggers = triggers.filter((t) => t.is_enabled).length;

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Product Configuration"
        subtitle="Create products and map rules, grids, scorecards and medical triggers in one step."
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 w-64"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Badge variant="secondary">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</Badge>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={fetchProducts}>
              <RefreshCw className="mr-2 h-4 w-4" />Refresh
            </Button>
            <Button type="button" size="sm" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />Add Product
            </Button>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={search ? 'Try a different search term' : 'Create your first product to get started'}
            action={!search ? { label: 'Add Product', onClick: openCreateDialog } : undefined}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onEdit={openEditDialog} onDelete={openDeleteDialog} />
            ))}
          </div>
        )}
      </div>

      {/* ── Dialog ─────────────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[92vh] max-w-3xl flex-col gap-0 p-0">
          <DialogHeader className="border-b px-6 py-4 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Configure product details, map rules / grids / scorecards and set medical triggers.
            </p>
          </DialogHeader>

          {/* ── Tab bar ── */}
          <div className="border-b px-6 pt-2 shrink-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-9 bg-transparent p-0 gap-0 border-b-0">
                <TabsTrigger
                  value="details"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 h-9 text-sm"
                >
                  Product Details
                </TabsTrigger>
                <TabsTrigger
                  value="mappings"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 h-9 text-sm"
                >
                  Rule Mappings
                  {totalMapped > 0 && (
                    <Badge variant="secondary" className="ml-1.5 h-4 min-w-4 px-1 text-xs">{totalMapped}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="medical"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 h-9 text-sm"
                >
                  Medical Triggers
                  {activeTriggers > 0 && (
                    <Badge className="ml-1.5 h-4 min-w-4 px-1 text-xs bg-rose-100 text-rose-700 border-rose-200">{activeTriggers}</Badge>
                  )}
                  {errors.triggers && (
                    <span className="ml-1 text-destructive text-xs">⚠</span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-5">

              {/* ── Tab: Details ── */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="pc-name">Product Name <span className="text-destructive">*</span></Label>
                      <Input id="pc-name" value={formData.name} onChange={updateField('name')} placeholder="e.g. GCLI Term Plan" />
                      <FieldError msg={errors.name} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pc-code">Product Code <span className="text-destructive">*</span></Label>
                      <Input id="pc-code" value={formData.code} onChange={updateField('code')} placeholder="e.g. E97" />
                      <FieldError msg={errors.code} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pc-type">Product Type <span className="text-destructive">*</span></Label>
                      <Select value={formData.product_type} onValueChange={updateField('product_type')}>
                        <SelectTrigger id="pc-type"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {PRODUCT_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError msg={errors.product_type} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pc-minprem">Min Premium (₹)</Label>
                      <Input id="pc-minprem" type="number" min={0} value={formData.min_premium} onChange={updateField('min_premium')} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="pc-minage">Min Age <span className="text-destructive">*</span></Label>
                      <Input id="pc-minage" type="number" min={0} value={formData.min_age} onChange={updateField('min_age')} />
                      <FieldError msg={errors.min_age} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pc-maxage">Max Age <span className="text-destructive">*</span></Label>
                      <Input id="pc-maxage" type="number" min={0} value={formData.max_age} onChange={updateField('max_age')} />
                      <FieldError msg={errors.max_age} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="pc-minsa">Min Sum Assured (₹) <span className="text-destructive">*</span></Label>
                      <Input id="pc-minsa" type="number" min={0} value={formData.min_sum_assured} onChange={updateField('min_sum_assured')} />
                      <FieldError msg={errors.min_sum_assured} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pc-maxsa">Max Sum Assured (₹) <span className="text-destructive">*</span></Label>
                      <Input id="pc-maxsa" type="number" min={0} value={formData.max_sum_assured} onChange={updateField('max_sum_assured')} />
                      <FieldError msg={errors.max_sum_assured} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="pc-desc">Description</Label>
                      <Textarea id="pc-desc" rows={2} value={formData.description} onChange={updateField('description')} placeholder="Optional" />
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-3 h-fit self-end">
                      <div>
                        <Label>Enabled</Label>
                        <p className="text-xs text-muted-foreground">Product is active for evaluation</p>
                      </div>
                      <Switch checked={!!formData.is_enabled} onCheckedChange={updateField('is_enabled')} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: Rule Mappings ── */}
              {activeTab === 'mappings' && (
                assetsLoading ? (
                  <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />Loading rules, grids &amp; scorecards…
                  </div>
                ) : (
                  <RuleMappingPanel assets={assets} mappings={mappings} onMappingsChange={setMappings} />
                )
              )}

              {/* ── Tab: Medical Triggers ── */}
              {activeTab === 'medical' && (
                <MedicalTriggerPanel triggers={triggers} onTriggersChange={setTriggers} />
              )}

            </div>
          </ScrollArea>

          <DialogFooter className="border-t px-6 py-4 shrink-0">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex gap-3 text-xs text-muted-foreground">
                {totalMapped > 0 && <span><strong>{totalMapped}</strong> asset{totalMapped > 1 ? 's' : ''} mapped</span>}
                {activeTriggers > 0 && <span><strong>{activeTriggers}</strong> medical trigger{activeTriggers > 1 ? 's' : ''}</span>}
                {totalMapped === 0 && activeTriggers === 0 && <span>No mappings or triggers yet</span>}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="button" onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving…' : selectedProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?
              This removes all its mappings and medical triggers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductConfiguration;
